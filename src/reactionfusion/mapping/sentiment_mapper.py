class SentimentMapper:
    """
    Phase 10: Rule-Based Sentiment Mapper.
    Takes probability outputs from the Neural Network and applies deterministic
    rules to categorize a post into Positive, Negative, Mixed, or Neutral,
    while providing a transparent JSON explanation.
    """
    def __init__(self, config=None):
        if config is None:
            # Default validation-based weights
            self.config = {
                "positive": {
                    "joy": 1.0, "affection": 0.8, "approval": 0.8, "pride": 0.7,
                    "gratitude": 0.8, "hope": 0.7, "excitement": 0.7, "relief": 0.6
                },
                "negative": {
                    "sadness": 1.0, "anger": 1.0, "fear": 0.8, "disgust": 0.9,
                    "disappointment": 0.9, "grief": 1.0, "jealousy": 0.7, "embarrassment": 0.6
                },
                "thresholds": {
                    "neutral_intensity": 0.25,
                    "positive": 0.45,
                    "negative": 0.45,
                    "sarcasm": 0.50,
                    "negative_context": 0.40,
                    "decision_margin": 0.15,
                    "evidence": 0.35
                }
            }
        else:
            self.config = config

    def _calculate_score(self, probs: dict, weight_dict: dict) -> float:
        score = 0.0
        total_weight = 0.0
        for emo, w in weight_dict.items():
            p = probs.get(emo, 0.0)
            score += p * w
            total_weight += w
        # Prevent division by zero
        return score / max(total_weight, 1e-9)

    def map_sentiment(self, probs: dict) -> dict:
        pos_score = self._calculate_score(probs, self.config["positive"])
        neg_score = self._calculate_score(probs, self.config["negative"])
        intensity = max(probs.values()) if probs else 0.0
        
        t = self.config["thresholds"]
        
        sentiment = "neutral"
        reason = ""
        
        # Sarcasm Context
        sarcasm = probs.get("sarcasm", 0.0)
        neg_context = max([
            probs.get("anger", 0.0), 
            probs.get("disappointment", 0.0), 
            probs.get("disgust", 0.0)
        ])
        
        # Decision Tree
        if intensity < t["neutral_intensity"]:
            sentiment = "neutral"
            reason = "Maximum emotion intensity is below the neutral threshold."
            
        elif pos_score >= t["positive"] and neg_score >= t["negative"]:
            sentiment = "mixed"
            reason = "Strong opposing positive and negative evidence."
            
        elif sarcasm >= t["sarcasm"] and neg_context >= t["negative_context"]:
            sentiment = "negative"
            reason = "Sarcasm detected alongside a strong negative context (anger/disappointment/disgust)."
            
        elif pos_score - neg_score >= t["decision_margin"]:
            sentiment = "positive"
            reason = "Positive evidence clearly outweighs negative evidence."
            
        elif neg_score - pos_score >= t["decision_margin"]:
            sentiment = "negative"
            reason = "Negative evidence clearly outweighs positive evidence."
            
        elif max(pos_score, neg_score) >= t["evidence"]:
            sentiment = "mixed"
            reason = "Similar nontrivial positive and negative evidence (margin too small to separate)."
            
        else:
            sentiment = "neutral"
            reason = "Evidence is present but insufficient to declare a clear polarity."
            
        # Confidence calculation
        if sentiment == "positive":
            confidence = pos_score
        elif sentiment == "negative":
            confidence = neg_score
        elif sentiment == "mixed":
            confidence = (pos_score + neg_score) / 2.0
        else:
            confidence = max(0.0, 1.0 - intensity)
            
        # Extract dominant emotions
        sorted_emos = sorted(probs.items(), key=lambda item: item[1], reverse=True)
        dominant = [{"emotion": k, "probability": round(float(v), 3)} for k, v in sorted_emos if v > 0.1][:3]
        
        return {
            "sentiment": sentiment,
            "confidence": round(float(confidence), 3),
            "positive_score": round(float(pos_score), 3),
            "negative_score": round(float(neg_score), 3),
            "dominant_emotions": dominant,
            "reason": reason
        }
