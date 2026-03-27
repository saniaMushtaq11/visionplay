from __future__ import annotations

import torch
import torch.nn as nn

# Use a simpler 3D CNN model instead of R3D_18
class Simple3DCNN(nn.Module):
    """Simple 3D CNN implementation"""
    def __init__(self):
        super().__init__()
        # Input: (B, 3, T, H, W)
        self.features = nn.Sequential(
            # Layer 1
            nn.Conv3d(3, 64, kernel_size=(3, 7, 7), stride=(1, 2, 2), padding=(1, 3, 3), bias=False),
            nn.BatchNorm3d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool3d(kernel_size=(1, 3, 3), stride=(1, 2, 2), padding=(0, 1, 1)),
            
            # Layer 2
            nn.Conv3d(64, 128, kernel_size=3, stride=(1, 2, 2), padding=1),
            nn.BatchNorm3d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool3d(kernel_size=2, stride=2),
            
            # Layer 3
            nn.Conv3d(128, 256, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm3d(256),
            nn.ReLU(inplace=True),
            nn.MaxPool3d(kernel_size=2, stride=2),
            
            # Layer 4
            nn.Conv3d(256, 512, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm3d(512),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool3d((1, 1, 1)),
        )
    
    def forward(self, x):
        x = self.features(x)
        x = torch.flatten(x, 1)
        return x  # Output shape: (B, 512)


class TrackingEncoder(nn.Module):
  """Encoder for player tracking data."""
  def __init__(self, input_dim: int = 10, hidden_dim: int = 64, output_dim: int = 256) -> None:
    super().__init__()
    self.lstm = nn.LSTM(
      input_size=input_dim,
      hidden_size=hidden_dim,
      num_layers=2,
      batch_first=True,
      bidirectional=True,
      dropout=0.2
    )
    self.fc = nn.Sequential(
      nn.Linear(hidden_dim * 2, output_dim),  # *2 for bidirectional
      nn.ReLU(inplace=True),
      nn.Dropout(p=0.2)
    )
    
  def forward(self, x: torch.Tensor) -> torch.Tensor:
    # x: (B, T, F) where T is sequence length and F is feature dim
    _, (hidden, _) = self.lstm(x)
    # Combine bidirectional states
    hidden = torch.cat([hidden[-2], hidden[-1]], dim=1)  # Get last layer, concat directions
    return self.fc(hidden)


class AttributeRegressor(nn.Module):
  def __init__(self, num_attributes: int, use_tracking: bool = True) -> None:
    super().__init__()
    # Use simple 3D CNN backbone for video
    self.backbone = Simple3DCNN()
    video_features = 512  # Output features from our Simple3DCNN model
    
    # Tracking data encoder
    self.use_tracking = use_tracking
    if use_tracking:
      self.tracking_encoder = TrackingEncoder(input_dim=10, hidden_dim=64, output_dim=256)
      combined_features = video_features + 256  # Video features + tracking features
    else:
      combined_features = video_features
    
    # Final prediction head
    self.regressor = nn.Sequential(
      nn.Linear(combined_features, 512),
      nn.ReLU(inplace=True),
      nn.Dropout(p=0.5),
      nn.Linear(512, 256),
      nn.ReLU(inplace=True),
      nn.Dropout(p=0.3),
      nn.Linear(256, num_attributes)
    )
  
  def forward(self, video: torch.Tensor, tracking: torch.Tensor = None) -> torch.Tensor:
    # video: (B, C, T, H, W) - batch, channels, time, height, width
    # tracking: (B, T, F) - batch, time, features
    video_features = self.backbone(video)
    
    if self.use_tracking and tracking is not None:
      tracking_features = self.tracking_encoder(tracking)
      combined = torch.cat([video_features, tracking_features], dim=1)
    else:
      combined = video_features
      
    return self.regressor(combined)


