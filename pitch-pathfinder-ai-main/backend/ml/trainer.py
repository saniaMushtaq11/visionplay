from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import List, Tuple, Dict, Any, Optional

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader, random_split, Subset
from tqdm import tqdm

from .dataset import scan_dataset_with_labels, load_clip_as_numpy
from .model import AttributeRegressor


# Define DummyItem as a proper class for pickling
class DummyItem:
  def __init__(self, attributes):
    self.path = None
    self.label = {attr: 0.0 for attr in attributes}
    self.tracking_data = None


class VideoDataset(Dataset):
  def __init__(self, root: Path, attributes: List[str], num_frames: int = 16, size: int = 112, use_tracking: bool = True) -> None:
    items, attrs = scan_dataset_with_labels(root)
    if attributes:
      self.attributes = attributes
    else:
      self.attributes = attrs
    self.items = items
    self.num_frames = num_frames
    self.size = size
    self.use_tracking = use_tracking
    
    # Count items with tracking data
    tracking_count = sum(1 for item in items if item.tracking_data is not None)
    print(f"Found {tracking_count} items with tracking data out of {len(items)} total items")
    
    # Ensure we have at least one item to prevent dataset splitting errors
    if len(items) == 0:
      print("Warning: No items found in the dataset. Creating a dummy item to prevent errors.")
      # Create a dummy item with zeros to prevent errors in training pipeline
      self.items = [DummyItem(self.attributes)]

  def __len__(self) -> int:
    return len(self.items)
    
  def _process_tracking_data(self, tracking_data: Dict[str, Any], num_frames: int) -> torch.Tensor:
    """Process tracking data into a fixed-size tensor suitable for the model.
    
    Args:
        tracking_data: Dictionary containing tracking data for a video
        num_frames: Number of frames to sample
        
    Returns:
        Tensor of shape (num_frames, num_features) containing processed tracking data
    """
    if tracking_data is None or "frames" not in tracking_data:
      # Return empty tensor if no tracking data
      return torch.zeros((num_frames, 10), dtype=torch.float32)
      
    frames = tracking_data["frames"]
    if not frames:
      return torch.zeros((num_frames, 10), dtype=torch.float32)
      
    # Sample frames evenly
    total_frames = len(frames)
    if total_frames >= num_frames:
      indices = np.linspace(0, total_frames - 1, num=num_frames, dtype=np.int32)
      sampled_frames = [frames[i] for i in indices]
    else:
      # If we have fewer frames than needed, repeat the last frame
      sampled_frames = frames + [frames[-1]] * (num_frames - total_frames)
      
    # Extract features from each frame
    features_list = []
    for frame in sampled_frames:
      # Extract relevant features from the frame
      features = self._extract_frame_features(frame)
      features_list.append(features)
      
    # Stack features into a tensor
    return torch.stack(features_list)
    
  def _extract_frame_features(self, frame: Dict[str, Any]) -> torch.Tensor:
    """Extract features from a single frame of tracking data.
    
    Features include:
    - Number of players
    - Ball position
    - Ball velocity
    - Player with ball position
    - Average player position
    - Player dispersion
    - etc.
    
    Returns:
        Tensor of shape (10,) containing extracted features
    """
    # Initialize features
    features = torch.zeros(10, dtype=torch.float32)
    
    # Extract players data
    players = frame.get("players", [])
    num_players = len(players)
    
    if num_players > 0:
      # Feature 1: Number of players (normalized)
      features[0] = min(num_players / 22.0, 1.0)  # Normalize by max players (22)
      
      # Calculate player positions
      positions = np.array([player.get("position", [0, 0]) for player in players])
      
      if positions.size > 0:
        # Feature 2-3: Average player position (normalized by field dimensions)
        avg_pos = positions.mean(axis=0) / np.array([100.0, 100.0])  # Normalize by field size
        features[1:3] = torch.tensor(avg_pos, dtype=torch.float32)
        
        # Feature 4: Player dispersion (standard deviation of positions)
        dispersion = positions.std(axis=0).mean() / 100.0  # Normalize
        features[3] = dispersion
    
    # Extract ball data
    ball = frame.get("ball", {})
    if ball:
      # Feature 5-6: Ball position (normalized)
      ball_pos = np.array(ball.get("position", [0, 0])) / np.array([100.0, 100.0])
      features[4:6] = torch.tensor(ball_pos, dtype=torch.float32)
      
      # Feature 7-8: Ball velocity (normalized)
      ball_vel = np.array(ball.get("velocity", [0, 0])) / np.array([10.0, 10.0])  # Normalize
      features[6:8] = torch.tensor(ball_vel, dtype=torch.float32)
    
    # Find player with ball
    player_with_ball = next((p for p in players if p.get("is_with_ball", False)), None)
    if player_with_ball:
      # Feature 9-10: Position of player with ball (normalized)
      pos = np.array(player_with_ball.get("position", [0, 0])) / np.array([100.0, 100.0])
      features[8:10] = torch.tensor(pos, dtype=torch.float32)
    
    return features

  def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
    item = self.items[idx]
    
    # Handle dummy item case (when path is None)
    if item.path is None:
      # Return zero tensors for video and tracking, and zeros for labels
      video_tensor = torch.zeros((3, self.num_frames, self.size, self.size), dtype=torch.float32)
      tracking_tensor = torch.zeros((self.num_frames, 10), dtype=torch.float32)
      label_tensor = torch.zeros((len(self.attributes),), dtype=torch.float32)
      return video_tensor, tracking_tensor, label_tensor
    
    # Load video and convert to tensor
    arr = load_clip_as_numpy(item.path, num_frames=self.num_frames, size=self.size)
    
    # Ensure we have exactly num_frames frames by padding or sampling
    if arr.shape[0] < self.num_frames:
      # Pad with zeros if we have fewer frames than needed
      padding = np.zeros((self.num_frames - arr.shape[0], arr.shape[1], arr.shape[2], arr.shape[3]), dtype=arr.dtype)
      arr = np.concatenate([arr, padding], axis=0)
    elif arr.shape[0] > self.num_frames:
      # Sample frames evenly if we have more frames than needed
      indices = np.linspace(0, arr.shape[0] - 1, num=self.num_frames, dtype=np.int32)
      arr = arr[indices]
    
    # (T,H,W,C) -> (C,T,H,W)
    arr = np.transpose(arr, (3, 0, 1, 2))
    video_tensor = torch.from_numpy(arr).float()
    
    # Process tracking data if available
    if self.use_tracking and item.tracking_data is not None:
      tracking_tensor = self._process_tracking_data(item.tracking_data, self.num_frames)
    else:
      tracking_tensor = torch.zeros((self.num_frames, 10), dtype=torch.float32)
    
    # Create label tensor
    label_tensor = torch.full((len(self.attributes),), float("nan"), dtype=torch.float32)
    if item.label:
      for i, attr in enumerate(self.attributes):
        if attr in item.label and item.label[attr] is not None:
          try:
            label_tensor[i] = float(item.label[attr])
          except (ValueError, TypeError):
            # Keep as NaN if conversion fails
            pass
    
    return video_tensor, tracking_tensor, label_tensor


def masked_mse_loss(pred: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
  mask = ~torch.isnan(target)
  if mask.sum() == 0:
    return torch.tensor(0.0, device=pred.device, requires_grad=True)
  diff = pred[mask] - target[mask]
  return (diff ** 2).mean()


@dataclass
class TrainConfig:
  data_root: Path
  out_dir: Path
  attributes: List[str]
  epochs: int = 5
  batch_size: int = 2
  lr: float = 1e-4
  num_workers: int = 2
  num_frames: int = 16
  size: int = 112
  val_split: float = 0.2
  device: str = "cuda" if torch.cuda.is_available() else "cpu"
  limit_samples: int | None = None
  use_tracking: bool = True


def train_model(cfg: TrainConfig) -> Path:
  original_ds = VideoDataset(cfg.data_root, cfg.attributes, cfg.num_frames, cfg.size, cfg.use_tracking)
  attributes = original_ds.attributes  # Store attributes before creating subset
  
  ds_full = original_ds
  if cfg.limit_samples is not None and cfg.limit_samples > 0:
    limit = min(cfg.limit_samples, len(ds_full))
    ds_full = Subset(ds_full, list(range(limit)))
    
  # Ensure we have at least 2 items for train/val split
  if len(ds_full) < 2:
    print("Warning: Dataset has fewer than 2 items. Creating a dummy validation set.")
    num_train = 1
    num_val = 1
    # If we have 0 items, both train and val will be empty but won't error
    # If we have 1 item, it will go to train and val will be empty
    ds_train, ds_val = Subset(ds_full, list(range(min(1, len(ds_full))))), Subset(ds_full, [])
  else:
    num_val = max(1, int(len(ds_full) * cfg.val_split))
    num_train = max(1, len(ds_full) - num_val)
    ds_train, ds_val = random_split(ds_full, [num_train, num_val])

  dl_train = DataLoader(ds_train, batch_size=cfg.batch_size, shuffle=True, num_workers=cfg.num_workers)
  dl_val = DataLoader(ds_val, batch_size=cfg.batch_size, shuffle=False, num_workers=cfg.num_workers)

  model = AttributeRegressor(num_attributes=len(attributes), use_tracking=cfg.use_tracking).to(cfg.device)
  opt = torch.optim.AdamW(model.parameters(), lr=cfg.lr)

  best_val = float("inf")
  cfg.out_dir.mkdir(parents=True, exist_ok=True)
  ckpt_path = cfg.out_dir / "best.pt"

  for epoch in range(cfg.epochs):
    model.train()
    pbar = tqdm(dl_train, desc=f"Epoch {epoch+1}/{cfg.epochs} [train]")
    for x_video, x_tracking, y in pbar:
      x_video = x_video.to(cfg.device)
      x_tracking = x_tracking.to(cfg.device)
      y = y.to(cfg.device)
      opt.zero_grad(set_to_none=True)
      pred = model(x_video, x_tracking)
      loss = masked_mse_loss(pred, y)
      loss.backward()
      opt.step()
      pbar.set_postfix({"loss": f"{loss.item():.4f}"})

    # Validation
    model.eval()
    val_losses: List[float] = []
    with torch.no_grad():
      for x_video, x_tracking, y in tqdm(dl_val, desc=f"Epoch {epoch+1}/{cfg.epochs} [val]"):
        x_video = x_video.to(cfg.device)
        x_tracking = x_tracking.to(cfg.device)
        y = y.to(cfg.device)
        pred = model(x_video, x_tracking)
        loss = masked_mse_loss(pred, y)
        val_losses.append(loss.item())
    val_mean = float(np.mean(val_losses)) if val_losses else float("inf")
    if val_mean < best_val:
      best_val = val_mean
      torch.save({
        "state_dict": model.state_dict(),
        "attributes": attributes,
        "use_tracking": cfg.use_tracking,
      }, ckpt_path)

  return ckpt_path


