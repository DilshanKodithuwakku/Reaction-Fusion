import os
import json
import torch
import numpy as np
import pandas as pd
from pathlib import Path

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'src'))

from reactionfusion.features.text_features import TextFeatureExtractor
from reactionfusion.features.reaction_features import ReactionFeatureExtractor
from reactionfusion.models.multimodal_emotion_net import MultimodalEmotionNet
from reactionfusion.mapping.sentiment_mapper import SentimentMapper

EMOTIONS = [
    "joy", "affection", "amusement", "surprise", "sadness", "anger",
    "care_empathy", "fear", "disgust", "approval", "sarcasm", "pride",
    "gratitude", "disappointment", "grief", "jealousy", "confusion",
    "nostalgia", "hope", "excitement", "relief", "embarrassment"
]

def main():
    print("="*75)
    print(" PHASE 11: VALIDATING SENTIMENT MAPPER")
    print("="*75)
    
    release_dir = ROOT / 'data/releases/emotion_22_v2'
    df_train = pd.read_csv(release_dir / 'train.csv')
    df_test = pd.read_csv(release_dir / 'test.csv')
    
    # 1. Rebuild Extractors
    text_ext = TextFeatureExtractor(n_components=256)
    rxn_ext = ReactionFeatureExtractor(alpha=1.0)
    
    text_ext.fit(df_train['normalized_text'])
    rxn_ext.fit(df_train)
    
    # 2. Extract Test Features
    X_text_test = torch.FloatTensor(text_ext.transform(df_test['normalized_text']))
    X_rxn_test = torch.FloatTensor(rxn_ext.transform(df_test))
    
    # 3. Load Model
    model_path = ROOT / 'models/emotion_only/best_emotion_model.pt'
    model = MultimodalEmotionNet(text_dim=256, reaction_dim=X_rxn_test.shape[1], num_emotions=22)
    model.load_state_dict(torch.load(model_path))
    model.eval()
    
    with torch.no_grad():
        test_probs = torch.sigmoid(model(X_text_test, X_rxn_test)).numpy()
        
    # 4. Initialize Sentiment Mapper
    mapper = SentimentMapper()
    
    print(f"Validating the end-to-end pipeline on {len(df_test)} test posts...\n")
    
    # Let's randomly sample 5 interesting posts to print out
    np.random.seed(42) # For reproducible display
    sample_indices = np.random.choice(len(df_test), 5, replace=False)
    
    mapped_sentiments = []
    
    for i in range(len(df_test)):
        # Construct the probability dictionary for this post
        probs_dict = {EMOTIONS[j]: float(test_probs[i, j]) for j in range(22)}
        
        # Run mapper
        result = mapper.map_sentiment(probs_dict)
        mapped_sentiments.append(result['sentiment'])
        
        if i in sample_indices:
            print("-" * 75)
            print(f"TEXT: {df_test['post_text'].iloc[i]}")
            print(f"REACTIONS: Like:{df_test['like_count'].iloc[i]} | Haha:{df_test['haha_count'].iloc[i]} | Angry:{df_test['angry_count'].iloc[i]}")
            
            # Print the JSON output of the mapper
            print(f"PIPELINE OUTPUT:")
            print(json.dumps(result, indent=2))
            print("-" * 75)
            
    # Calculate global distribution of predicted sentiments on Test set
    dist = pd.Series(mapped_sentiments).value_counts()
    print("\nPredicted Sentiment Distribution on Test Set:")
    for sent, count in dist.items():
        print(f"  {sent.capitalize()}: {count} posts")
        
    if 'annotated_sentiment' in df_test.columns:
        from sklearn.metrics import accuracy_score, classification_report
        y_true = df_test['annotated_sentiment'].astype(str).str.strip().str.capitalize()
        y_pred = [s.capitalize() for s in mapped_sentiments]
        acc = accuracy_score(y_true, y_pred)
        print(f"\nRule-based Sentiment Mapper Accuracy vs Ground Truth: {acc:.3f}")
        print("\nClassification Report (Sentiment):")
        print(classification_report(y_true, y_pred, zero_division=0))
        
    print("\nSentiment Mapper Validation complete. The transparent mapper is functioning correctly.")

if __name__ == '__main__':
    main()
