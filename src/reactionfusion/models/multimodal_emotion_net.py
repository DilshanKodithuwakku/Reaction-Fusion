import torch
import torch.nn as nn

class MultimodalEmotionNet(nn.Module):
    """
    Phase 6: Fusion Network.
    Takes 256-dimensional text representations and 31-dimensional reaction features.
    Outputs raw logits for exactly 22 emotions. There is no sentiment head.
    """
    def __init__(self, text_dim=256, reaction_dim=31, num_emotions=22, dropout_rate=0.5):
        super(MultimodalEmotionNet, self).__init__()
        
        combined_dim = text_dim + reaction_dim
        
        self.fusion_layers = nn.Sequential(
            nn.Linear(combined_dim, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(dropout_rate),
            
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(dropout_rate)
        )
        
        self.emotion_head = nn.Linear(128, num_emotions)
        
    def forward(self, text_features, reaction_features):
        # In Stage B, the text_encoder and reaction_encoder logic could live here.
        # For Stage A, inputs are already dense representations.
        fused = torch.cat([text_features, reaction_features], dim=1)
        hidden = self.fusion_layers(fused)
        return self.emotion_head(hidden)
