import os
import random
import json
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from sklearn.metrics import average_precision_score
from pathlib import Path

import sys
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'src'))

from reactionfusion.features.text_features import TextFeatureExtractor
from reactionfusion.features.reaction_features import ReactionFeatureExtractor
from reactionfusion.models.multimodal_emotion_net import MultimodalEmotionNet

# Phase 7 Setup
def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

set_seed(42)

# Load configuration (hardcoded here for the script, but matches JSON metadata)
EMOTIONS = [
    "joy", "affection", "amusement", "surprise", "sadness", "anger",
    "care_empathy", "fear", "disgust", "approval", "sarcasm", "pride",
    "gratitude", "disappointment", "grief", "jealousy", "confusion",
    "nostalgia", "hope", "excitement", "relief", "embarrassment"
]

class EmotionDataset(Dataset):
    def __init__(self, text_feats, rxn_feats, targets, masks):
        self.text_feats = torch.FloatTensor(text_feats)
        self.rxn_feats = torch.FloatTensor(rxn_feats)
        self.targets = torch.FloatTensor(targets)
        self.masks = torch.FloatTensor(masks)
        
    def __len__(self):
        return len(self.targets)
        
    def __getitem__(self, idx):
        return self.text_feats[idx], self.rxn_feats[idx], self.targets[idx], self.masks[idx]

def main():
    print("="*75)
    print(" PHASE 7: TRAINING EMOTION MODEL (LEAKAGE-SAFE)")
    print("="*75)
    
    release_dir = ROOT / 'data/releases/emotion_22_v2'
    df_train = pd.read_csv(release_dir / 'train.csv')
    df_val = pd.read_csv(release_dir / 'validation.csv')
    # Test set is explicitly NOT loaded to enforce zero test-leakage during development
    
    # 1. Fit Extractors strictly on Train
    print("Fitting Feature Extractors on Training split only...")
    text_ext = TextFeatureExtractor(n_components=256)
    rxn_ext = ReactionFeatureExtractor(alpha=1.0)
    
    X_text_train = text_ext.fit_transform(df_train['normalized_text'])
    X_rxn_train = rxn_ext.fit_transform(df_train)
    
    X_text_val = text_ext.transform(df_val['normalized_text'])
    X_rxn_val = rxn_ext.transform(df_val)
    
    # 2. Extract Targets and Masks
    Y_train = df_train[EMOTIONS].values
    M_train = df_train[[f"{e}_mask" for e in EMOTIONS]].values
    
    Y_val = df_val[EMOTIONS].values
    M_val = df_val[[f"{e}_mask" for e in EMOTIONS]].values
    
    # 3. Calculate Clamped Positive Weights
    # w_e = N_e_neg / N_e_pos (using masked valid counts)
    valid_train = M_train == 1
    positives = (Y_train * valid_train).sum(axis=0)
    negatives = ((1 - Y_train) * valid_train).sum(axis=0)
    
    # Avoid div by zero for extremely rare classes that might have 0 in a split
    positives = np.maximum(positives, 1)
    
    pos_weight = negatives / positives
    pos_weight = np.clip(pos_weight, a_min=1.0, a_max=30.0)
    pos_weight_tensor = torch.FloatTensor(pos_weight)
    
    print("\nCalculated Positive Class Weights (Clamped 1-30):")
    for i, e in enumerate(EMOTIONS):
        if pos_weight[i] >= 30.0:
            print(f"  {e}: {pos_weight[i]:.1f} (Capped)")
            
    # 4. Prepare Dataloaders and Model
    train_loader = DataLoader(EmotionDataset(X_text_train, X_rxn_train, Y_train, M_train), batch_size=32, shuffle=True)
    val_loader = DataLoader(EmotionDataset(X_text_val, X_rxn_val, Y_val, M_val), batch_size=32, shuffle=False)
    
    model = MultimodalEmotionNet(text_dim=256, reaction_dim=X_rxn_train.shape[1], num_emotions=22)
    optimizer = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
    
    # reduction="none" so we can apply the validity mask
    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight_tensor, reduction="none")
    
    # 5. Training Loop with Early Stopping via Average Precision
    max_epochs = 50
    patience = 7
    best_val_ap = -1.0
    epochs_without_improvement = 0
    
    best_model_path = ROOT / 'models/emotion_only/best_emotion_model.pt'
    if best_model_path.exists():
        import shutil
        v1_backup = ROOT / 'models/emotion_only/v1_best_emotion_model.pt'
        shutil.copyfile(best_model_path, v1_backup)
        print(f"Backed up previous model checkpoint to: {v1_backup}")
    
    print("\nStarting Training...")
    for epoch in range(max_epochs):
        model.train()
        total_loss = 0.0
        total_masked_items = 0
        
        for batch_text, batch_rxn, batch_y, batch_mask in train_loader:
            optimizer.zero_grad()
            logits = model(batch_text, batch_rxn)
            
            raw_loss = criterion(logits, batch_y)
            masked_loss = raw_loss * batch_mask
            
            # Average loss over valid (masked) predictions only
            valid_items = batch_mask.sum()
            if valid_items > 0:
                loss = masked_loss.sum() / valid_items
                loss.backward()
                optimizer.step()
                
                total_loss += loss.item() * valid_items.item()
                total_masked_items += valid_items.item()
                
        avg_train_loss = total_loss / max(1, total_masked_items)
        
        # Validation Step
        model.eval()
        val_loss = 0.0
        val_masked_items = 0
        all_preds = []
        all_truth = []
        all_masks = []
        
        with torch.no_grad():
            for batch_text, batch_rxn, batch_y, batch_mask in val_loader:
                logits = model(batch_text, batch_rxn)
                
                raw_loss = criterion(logits, batch_y)
                masked_loss = raw_loss * batch_mask
                valid_items = batch_mask.sum()
                if valid_items > 0:
                    val_loss += (masked_loss.sum()).item()
                    val_masked_items += valid_items.item()
                
                # Convert logits to probabilities for AP calculation
                probs = torch.sigmoid(logits)
                all_preds.append(probs.numpy())
                all_truth.append(batch_y.numpy())
                all_masks.append(batch_mask.numpy())
                
        avg_val_loss = val_loss / max(1, val_masked_items)
        
        # Calculate Macro Average Precision (ignoring masked elements for each class)
        all_preds = np.vstack(all_preds)
        all_truth = np.vstack(all_truth)
        all_masks = np.vstack(all_masks)
        
        ap_scores = []
        for i in range(22):
            valid_idx = all_masks[:, i] == 1
            if valid_idx.sum() > 0 and all_truth[valid_idx, i].sum() > 0:
                ap = average_precision_score(all_truth[valid_idx, i], all_preds[valid_idx, i])
                ap_scores.append(ap)
                
        macro_ap = np.mean(ap_scores) if ap_scores else 0.0
        
        print(f"Epoch {epoch+1:02d} | Train Loss: {avg_train_loss:.4f} | Val Loss: {avg_val_loss:.4f} | Val Macro-AP: {macro_ap:.4f}")
        
        if macro_ap > best_val_ap:
            best_val_ap = macro_ap
            epochs_without_improvement = 0
            torch.save(model.state_dict(), best_model_path)
        else:
            epochs_without_improvement += 1
            if epochs_without_improvement >= patience:
                print(f"\nEarly stopping triggered at epoch {epoch+1}. Best Val Macro-AP: {best_val_ap:.4f}")
                break

    print(f"Model saved to {best_model_path}")

if __name__ == '__main__':
    main()
