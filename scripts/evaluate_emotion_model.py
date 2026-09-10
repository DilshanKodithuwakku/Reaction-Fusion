import os
import random
import json
import numpy as np
import pandas as pd
import torch
from pathlib import Path
from sklearn.metrics import (
    f1_score, precision_score, recall_score, 
    average_precision_score, hamming_loss, accuracy_score
)

import sys
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'src'))

from reactionfusion.features.text_features import TextFeatureExtractor
from reactionfusion.features.reaction_features import ReactionFeatureExtractor
from reactionfusion.models.multimodal_emotion_net import MultimodalEmotionNet

def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)

set_seed(42)

EMOTIONS = [
    "joy", "affection", "amusement", "surprise", "sadness", "anger",
    "care_empathy", "fear", "disgust", "approval", "sarcasm", "pride",
    "gratitude", "disappointment", "grief", "jealousy", "confusion",
    "nostalgia", "hope", "excitement", "relief", "embarrassment"
]

def main():
    print("="*75)
    print(" PHASE 8 & 9: THRESHOLD TUNING & TEST EVALUATION")
    print("="*75)
    
    release_dir = ROOT / 'data/releases/emotion_22_v2'
    df_train = pd.read_csv(release_dir / 'train.csv')
    df_val = pd.read_csv(release_dir / 'validation.csv')
    df_test = pd.read_csv(release_dir / 'test.csv')
    
    # 1. Deterministically rebuild feature extractors
    print("Rebuilding Feature Extractors from Train split...")
    text_ext = TextFeatureExtractor(n_components=256)
    rxn_ext = ReactionFeatureExtractor(alpha=1.0)
    
    text_ext.fit(df_train['normalized_text'])
    rxn_ext.fit(df_train)
    
    X_text_val = torch.FloatTensor(text_ext.transform(df_val['normalized_text']))
    X_rxn_val = torch.FloatTensor(rxn_ext.transform(df_val))
    
    X_text_test = torch.FloatTensor(text_ext.transform(df_test['normalized_text']))
    X_rxn_test = torch.FloatTensor(rxn_ext.transform(df_test))
    
    Y_val = df_val[EMOTIONS].values
    M_val = df_val[[f"{e}_mask" for e in EMOTIONS]].values
    Y_test = df_test[EMOTIONS].values
    M_test = df_test[[f"{e}_mask" for e in EMOTIONS]].values
    
    # 2. Load Model
    model_path = ROOT / 'models/emotion_only/best_emotion_model.pt'
    model = MultimodalEmotionNet(text_dim=256, reaction_dim=X_rxn_val.shape[1], num_emotions=22)
    model.load_state_dict(torch.load(model_path))
    model.eval()
    
    with torch.no_grad():
        val_probs = torch.sigmoid(model(X_text_val, X_rxn_val)).numpy()
        test_probs = torch.sigmoid(model(X_text_test, X_rxn_test)).numpy()
        
    # =========================================================================
    # PHASE 8: THRESHOLD TUNING ON VALIDATION SET
    # =========================================================================
    print("Tuning per-emotion thresholds on Validation Set...")
    optimal_thresholds = {}
    
    for i, emo in enumerate(EMOTIONS):
        valid_idx = M_val[:, i] == 1
        y_true = Y_val[valid_idx, i]
        y_prob = val_probs[valid_idx, i]
        
        best_t = 0.5
        best_f1 = -1.0
        
        if y_true.sum() > 0:
            for t in np.arange(0.05, 0.95, 0.05):
                y_pred = (y_prob >= t).astype(int)
                f1 = f1_score(y_true, y_pred, zero_division=0)
                if f1 > best_f1:
                    best_f1 = f1
                    best_t = t
        optimal_thresholds[emo] = round(float(best_t), 2)
        
    # Save thresholds
    os.makedirs(ROOT / 'configs', exist_ok=True)
    with open(ROOT / 'configs/emotion_model.yaml', 'w') as f:
        f.write("optimal_thresholds:\n")
        for emo, t in optimal_thresholds.items():
            f.write(f"  {emo}: {t}\n")
    print(f"Saved optimal thresholds to configs/emotion_model.yaml")
    
    # =========================================================================
    # PHASE 9: EVALUATION ON TEST SET
    # =========================================================================
    print("\nEvaluating on held-out Test Set...")
    
    # Apply thresholds
    test_preds = np.zeros_like(test_probs)
    for i, emo in enumerate(EMOTIONS):
        test_preds[:, i] = (test_probs[:, i] >= optimal_thresholds[emo]).astype(int)
        
    # Calculate global metrics on valid (masked) elements only
    y_true_flat = []
    y_pred_flat = []
    
    # For subset accuracy, we only consider rows where ALL emotions were validly annotated
    fully_valid_mask = M_test.sum(axis=1) == 22
    if fully_valid_mask.sum() > 0:
        subset_acc = accuracy_score(Y_test[fully_valid_mask], test_preds[fully_valid_mask])
    else:
        subset_acc = 0.0
        
    results_table = []
    
    for i, emo in enumerate(EMOTIONS):
        valid_idx = M_test[:, i] == 1
        y_t = Y_test[valid_idx, i]
        y_p = test_preds[valid_idx, i]
        y_prob = test_probs[valid_idx, i]
        
        y_true_flat.extend(y_t)
        y_pred_flat.extend(y_p)
        
        support = int(y_t.sum())
        if support == 0:
            results_table.append(f"| {emo.capitalize()} | 0 | - | - | - | - |")
            continue
            
        prec = precision_score(y_t, y_p, zero_division=0)
        rec = recall_score(y_t, y_p, zero_division=0)
        f1 = f1_score(y_t, y_p, zero_division=0)
        ap = average_precision_score(y_t, y_prob)
        
        is_exploratory = support < 5
        
        f1_str = "exploratory" if is_exploratory else f"{f1:.3f}"
        
        results_table.append(
            f"| {emo.capitalize()} | {support} | {prec:.3f} | {rec:.3f} | {f1_str} | {ap:.3f} |"
        )
        
    # True Multilabel Metrics (ignoring True Negatives which inflate flat accuracy)
    total_tp = 0
    total_fp = 0
    total_fn = 0
    per_class_f1s = []
    
    for i, emo in enumerate(EMOTIONS):
        valid_idx = M_test[:, i] == 1
        y_t = Y_test[valid_idx, i]
        y_p = test_preds[valid_idx, i]
        
        tp = np.sum((y_t == 1) & (y_p == 1))
        fp = np.sum((y_t == 0) & (y_p == 1))
        fn = np.sum((y_t == 1) & (y_p == 0))
        
        total_tp += tp
        total_fp += fp
        total_fn += fn
        
        if (tp + fp + fn) > 0:  # Only count classes that have some ground truth or predictions
            f1 = 2 * tp / (2 * tp + fp + fn) if (2 * tp + fp + fn) > 0 else 0.0
            per_class_f1s.append(f1)
            
    global_micro_f1 = 2 * total_tp / (2 * total_tp + total_fp + total_fn) if (2 * total_tp + total_fp + total_fn) > 0 else 0.0
    global_macro_f1 = np.mean(per_class_f1s) if per_class_f1s else 0.0
    
    # Calculate Macro-AP
    ap_scores = []
    for i in range(22):
        valid_idx = M_test[:, i] == 1
        if valid_idx.sum() > 0 and Y_test[valid_idx, i].sum() > 0:
            ap_scores.append(average_precision_score(Y_test[valid_idx, i], test_probs[valid_idx, i]))
    global_macro_ap = np.mean(ap_scores) if ap_scores else 0.0

    global_hamming = hamming_loss(y_true_flat, y_pred_flat)
    
    print("\n" + "="*60)
    print(" FINAL TEST METRICS (N=430)")
    print("="*60)
    print(f"Macro-AP       : {global_macro_ap:.3f}")
    print(f"Macro-F1       : {global_macro_f1:.3f}")
    print(f"Micro-F1       : {global_micro_f1:.3f}")
    print(f"Hamming Loss   : {global_hamming:.3f}")
    print(f"Subset Accuracy: {subset_acc:.3f} (Exact match across all 22 labels)")
    print("\n| Emotion | Support | Precision | Recall | F1 | AP |")
    print("|---|---:|---:|---:|---:|---:|")
    print("\n".join(results_table))
    print("="*60)
    
    # Save versioned JSON report
    report = {
        "dataset_version": "emotion_22_v2",
        "split": "test",
        "n_samples": int(len(df_test)),
        "metrics": {
            "macro_ap": float(global_macro_ap),
            "macro_f1": float(global_macro_f1),
            "micro_f1": float(global_micro_f1),
            "hamming_loss": float(global_hamming),
            "subset_accuracy": float(subset_acc)
        }
    }
    os.makedirs(ROOT / 'reports', exist_ok=True)
    with open(ROOT / 'reports/evaluation_v2.json', 'w') as f:
        json.dump(report, f, indent=2)
    print("Saved metrics to reports/evaluation_v2.json")

if __name__ == '__main__':
    main()
