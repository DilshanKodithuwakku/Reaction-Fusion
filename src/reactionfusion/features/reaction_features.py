import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

class ReactionFeatureExtractor:
    """
    Self-contained feature extractor for Facebook reactions.
    Calculates smoothed proportions, anchors, interactions, and standardizes them
    using statistics fitted ONLY on the training split to prevent leakage.
    """
    
    def __init__(self, alpha=1.0):
        self.alpha = alpha
        self.scaler = StandardScaler()
        self.reaction_cols = [
            'like_count', 'love_count', 'care_count', 'haha_count', 
            'wow_count', 'sad_count', 'angry_count'
        ]
        
    def _extract_raw(self, df: pd.DataFrame) -> np.ndarray:
        # Extract raw counts
        counts = df[self.reaction_cols].fillna(0).values.astype(np.float32)
        
        # 1. Smoothed Ratios
        total_counts = np.sum(counts, axis=1, keepdims=True)
        smoothed_ratios = (counts + self.alpha) / (total_counts + 7 * self.alpha)
        
        # 2. log1p(total_reactions)
        log1p_total = np.log1p(total_counts)
        
        # 3. Reaction Entropy
        entropy = -np.sum(smoothed_ratios * np.log(smoothed_ratios + 1e-9), axis=1, keepdims=True)
        
        # 4. Difference between largest and second-largest ratios
        sorted_ratios = np.sort(smoothed_ratios, axis=1)
        margin = (sorted_ratios[:, -1] - sorted_ratios[:, -2]).reshape(-1, 1)
        
        # 5. Most dominant reaction (One-Hot Encoded, 7 dimensions)
        dominant_idx = np.argmax(smoothed_ratios, axis=1)
        dominant_one_hot = np.zeros_like(smoothed_ratios)
        dominant_one_hot[np.arange(len(dominant_idx)), dominant_idx] = 1.0
        
        # 6. Anchors
        # Indices: Like=0, Love=1, Care=2, Haha=3, Wow=4, Sad=5, Angry=6
        pos_anchor = (smoothed_ratios[:, 1] + smoothed_ratios[:, 2]).reshape(-1, 1) # Love + Care
        neg_anchor = (smoothed_ratios[:, 5] + smoothed_ratios[:, 6]).reshape(-1, 1) # Sad + Angry
        amb_mass = (smoothed_ratios[:, 0] + smoothed_ratios[:, 3] + smoothed_ratios[:, 4]).reshape(-1, 1) # Like + Haha + Wow
        
        # 7. Interactions
        love_sad = (smoothed_ratios[:, 1] * smoothed_ratios[:, 5]).reshape(-1, 1)
        haha_angry = (smoothed_ratios[:, 3] * smoothed_ratios[:, 6]).reshape(-1, 1)
        care_sad = (smoothed_ratios[:, 2] * smoothed_ratios[:, 5]).reshape(-1, 1)
        pos_neg_opp = (pos_anchor * neg_anchor).reshape(-1, 1)
        
        # 8. Log1p of raw counts (useful magnitude context)
        log1p_counts = np.log1p(counts)
        
        # Combine all features
        # 7(ratios) + 1(total) + 1(entropy) + 1(margin) + 7(dominant) + 3(anchors) + 4(interactions) + 7(log counts) = 31 features
        features = np.hstack([
            smoothed_ratios,
            log1p_total,
            entropy,
            margin,
            dominant_one_hot,
            pos_anchor,
            neg_anchor,
            amb_mass,
            love_sad,
            haha_angry,
            care_sad,
            pos_neg_opp,
            log1p_counts
        ])
        
        return features

    def fit(self, df_train: pd.DataFrame):
        """Fits the StandardScaler on the training data only."""
        raw_features = self._extract_raw(df_train)
        self.scaler.fit(raw_features)
        self.feature_dim = raw_features.shape[1]
        return self
        
    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """Extracts and scales features for any split."""
        raw_features = self._extract_raw(df)
        return self.scaler.transform(raw_features)
    
    def fit_transform(self, df_train: pd.DataFrame) -> np.ndarray:
        return self.fit(df_train).transform(df_train)
