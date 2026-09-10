import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import joblib
import numpy as np
import pandas as pd
import torch

from reactionfusion.mapping.sentiment_mapper import SentimentMapper
from reactionfusion.models.multimodal_emotion_net import MultimodalEmotionNet

EMOTIONS = [
    "joy", "affection", "amusement", "surprise", "sadness", "anger",
    "care_empathy", "fear", "disgust", "approval", "sarcasm", "pride",
    "gratitude", "disappointment", "grief", "jealousy", "confusion",
    "nostalgia", "hope", "excitement", "relief", "embarrassment"
]

REACTION_COLS = [
    "like_count", "love_count", "care_count", "haha_count",
    "wow_count", "sad_count", "angry_count"
]


class ReactionFusionPredictor:
    """
    Production-ready multimodal predictor for ReactionFusion.
    Takes:
      - Text: Post's comments (combined text of all comments; NO post text).
      - Reactions: Post's 7 reaction counts (Like, Love, Care, Haha, Wow, Sad, Angry).
    """

    _instance = None

    def __init__(
        self,
        model_path: Optional[Union[str, Path]] = None,
        text_extractor_path: Optional[Union[str, Path]] = None,
        rxn_extractor_path: Optional[Union[str, Path]] = None,
    ):
        base_dir = Path(__file__).resolve().parent.parent.parent.parent
        self.model_path = Path(model_path or base_dir / "models/emotion_only/best_emotion_model.pt")
        self.text_extractor_path = Path(
            text_extractor_path or base_dir / "models/emotion_only/text_extractor.joblib"
        )
        self.rxn_extractor_path = Path(
            rxn_extractor_path or base_dir / "models/emotion_only/reaction_extractor.joblib"
        )

        self._load_components()

    def _load_components(self):
        if not self.text_extractor_path.exists():
            raise FileNotFoundError(f"Text extractor not found at {self.text_extractor_path}")
        if not self.rxn_extractor_path.exists():
            raise FileNotFoundError(f"Reaction extractor not found at {self.rxn_extractor_path}")
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model weights not found at {self.model_path}")

        self.text_extractor = joblib.load(self.text_extractor_path)
        self.rxn_extractor = joblib.load(self.rxn_extractor_path)

        # Initialize and load model
        rxn_dim = getattr(self.rxn_extractor, "feature_dim", 31)
        self.model = MultimodalEmotionNet(text_dim=256, reaction_dim=rxn_dim, num_emotions=22)
        state_dict = torch.load(self.model_path, map_location=torch.device("cpu"))
        self.model.load_state_dict(state_dict)
        self.model.eval()

        self.mapper = SentimentMapper()

        # Load optimal thresholds from configs/emotion_model.yaml if available
        self.dataset_version = "emotion_22_v2"
        self.optimal_thresholds = {}
        config_path = Path(__file__).resolve().parent.parent.parent.parent / "configs/emotion_model.yaml"
        if config_path.exists():
            try:
                import yaml
                with open(config_path, "r", encoding="utf-8") as f:
                    cfg = yaml.safe_load(f)
                    self.optimal_thresholds = cfg.get("optimal_thresholds", {})
            except Exception:
                pass

    @classmethod
    def get_default(cls) -> "ReactionFusionPredictor":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _clean_text(self, text: str) -> str:
        if not text:
            return ""
        text = re.sub(r"https?://\S+|www\.\S+", "", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def _prepare_reactions_df(self, reactions: Optional[Dict[str, int]]) -> pd.DataFrame:
        rxn_data = {}
        norm_rxns = {str(k).lower(): v for k, v in (reactions or {}).items()}
        for col in REACTION_COLS:
            short_name = col.replace("_count", "").lower()
            val = norm_rxns.get(col.lower(), norm_rxns.get(short_name, 0))
            try:
                rxn_data[col] = [max(0.0, float(val))]
            except (ValueError, TypeError):
                rxn_data[col] = [0.0]
        return pd.DataFrame(rxn_data)

    def _infer_single(self, text: str, reactions_dict: Dict[str, int]) -> Dict[str, Any]:
        """Feature extraction, neural forward pass, and sentiment mapping."""
        cleaned_text = self._clean_text(text) or "නැත"
        rxn_df = self._prepare_reactions_df(reactions_dict)

        X_text = self.text_extractor.transform(pd.Series([cleaned_text]))
        X_rxn = self.rxn_extractor.transform(rxn_df)

        tensor_text = torch.FloatTensor(X_text)
        tensor_rxn = torch.FloatTensor(X_rxn)

        with torch.no_grad():
            logits = self.model(tensor_text, tensor_rxn)
            probs = torch.sigmoid(logits).numpy()[0]

        probs_dict = {EMOTIONS[i]: float(probs[i]) for i in range(len(EMOTIONS))}
        sentiment_result = self.mapper.map_sentiment(probs_dict)

        raw_rxn_counts = rxn_df.iloc[0].to_dict()
        total_reactions = sum(raw_rxn_counts.values())

        active_emotions = []
        for emo, prob in probs_dict.items():
            threshold = self.optimal_thresholds.get(emo, 0.5)
            if prob >= threshold:
                active_emotions.append({
                    "emotion": emo,
                    "probability": round(float(prob), 3),
                    "threshold": threshold
                })
        active_emotions.sort(key=lambda x: x["probability"], reverse=True)

        return {
            "sentiment": sentiment_result["sentiment"],
            "confidence": sentiment_result["confidence"],
            "positive_score": sentiment_result["positive_score"],
            "negative_score": sentiment_result["negative_score"],
            "dominant_emotions": sentiment_result["dominant_emotions"],
            "active_emotions": active_emotions,
            "reason": sentiment_result["reason"],
            "all_emotions": {k: round(v, 4) for k, v in probs_dict.items()},
            "reactions_summary": {
                "counts": {k.replace("_count", ""): int(v) for k, v in raw_rxn_counts.items()},
                "total": int(total_reactions)
            }
        }

    def predict(
        self,
        comments: List[Union[str, Dict[str, Any]]],
        post_reactions: Optional[Dict[str, int]] = None,
        reactions: Optional[Dict[str, int]] = None,
        post_text: str = "",  # Kept in signature for compat, but strictly ignored
    ) -> Dict[str, Any]:
        """
        Main multimodal inference method.
        - Text: Post's comments concatenated together (post_text is discarded).
        - Reactions: Post's 7 reaction counts (Like, Love, Care, Haha, Wow, Sad, Angry).
        """
        rxns = post_reactions if post_reactions is not None else (reactions or {})

        valid_comments = []
        for item in (comments or []):
            if isinstance(item, str):
                cleaned = self._clean_text(item)
                if cleaned:
                    valid_comments.append(cleaned)
            elif isinstance(item, dict):
                cleaned = self._clean_text(item.get("text", ""))
                if cleaned:
                    valid_comments.append(cleaned)

        # Handle zero comments edge case
        if not valid_comments:
            return {
                "dataset_version": self.dataset_version,
                "status": "no_comments",
                "message": "No Sinhala comments detected under this post to analyze.",
                "comments_analyzed": 0,
                "sentiment": "neutral",
                "confidence": 0.0,
                "positive_score": 0.0,
                "negative_score": 0.0,
                "dominant_emotions": [],
                "active_emotions": [],
                "reason": "This model analyzes audience discourse from post comments and post reactions. No comments were found.",
                "all_emotions": {e: 0.0 for e in EMOTIONS},
                "reactions_summary": {
                    "counts": {k.replace("_count", ""): int(v) for k, v in rxns.items()},
                    "total": sum(rxns.values()) if rxns else 0
                }
            }

        # Combine all comment texts into a single document
        unified_comments_text = " . ".join(valid_comments)

        # Infer using post comments text + post reaction counts
        result = self._infer_single(unified_comments_text, rxns)
        result["dataset_version"] = self.dataset_version
        result["status"] = "success"
        result["text_source"] = "post_comments_only"
        result["comments_analyzed"] = len(valid_comments)
        return result
