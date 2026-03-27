from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Dict, Tuple, Any
import json
import os
import numpy as np

from .config import get_dataset_root, VIDEO_EXTENSIONS


@dataclass
class VideoItem:
  path: Path
  label: Optional[Dict[str, float]] = None
  tracking_data: Optional[Dict[str, Any]] = None


def is_video_file(path: Path) -> bool:
  return path.suffix.lower() in VIDEO_EXTENSIONS


def scan_dataset(root: Optional[Path] = None) -> List[VideoItem]:
  base = root or get_dataset_root()
  items: List[VideoItem] = []
  if not base.exists():
    return items
  for p in base.rglob('*'):
    if p.is_file() and is_video_file(p):
      items.append(VideoItem(path=p))
  return items


def load_labels_json(root: Optional[Path] = None) -> Tuple[List[str], Dict[Path, Dict[str, float]]]:
  base = root or get_dataset_root()
  labels_path = base / "labels.json"
  if not labels_path.exists():
    return [], {}
  with labels_path.open("r", encoding="utf-8") as f:
    data = json.load(f)
  attributes = data.get("attributes", [])
  items = {}
  for entry in data.get("items", []):
    rel = entry.get("path")
    labs = entry.get("labels", {})
    if not isinstance(rel, str) or not isinstance(labs, dict):
      continue
    abs_path = (base / rel).resolve()
    items[abs_path] = labs
  return attributes, items


def load_tracking_data(root: Optional[Path] = None) -> Dict[Path, Dict[str, Any]]:
  """Load player tracking data from the tracking_data directory.
  
  Expected structure:
  - tracking_data/
    - video1_name.json
    - video2_name.json
    - ...
  
  Each JSON file should contain tracking data that corresponds to a video file.
  The filename (without extension) should match the video filename.
  """
  base = root or get_dataset_root()
  tracking_dir = base / "tracking_data"
  tracking_data = {}
  
  if not tracking_dir.exists():
    return tracking_data
    
  # Map video files to their corresponding tracking data files
  video_items = scan_dataset(base)
  video_map = {p.path.stem: p.path for p in video_items}
  
  for p in tracking_dir.glob('*.json'):
    video_name = p.stem
    if video_name in video_map:
      try:
        with p.open('r', encoding='utf-8') as f:
          data = json.load(f)
          tracking_data[video_map[video_name].resolve()] = data
      except (json.JSONDecodeError, IOError) as e:
        print(f"Error loading tracking data from {p}: {e}")
        
  return tracking_data


def scan_dataset_with_labels(root: Optional[Path] = None) -> Tuple[List[VideoItem], List[str]]:
  attributes, label_map = load_labels_json(root)
  tracking_map = load_tracking_data(root)
  items = scan_dataset(root)
  enriched: List[VideoItem] = []
  for it in items:
    resolved_path = it.path.resolve()
    labels = label_map.get(resolved_path)
    tracking = tracking_map.get(resolved_path)
    enriched.append(VideoItem(path=it.path, label=labels, tracking_data=tracking))
  return enriched, attributes


def load_clip_as_numpy(path: Path, num_frames: int = 16, size: int = 112) -> np.ndarray:
  import cv2
  import numpy as np
  cap = cv2.VideoCapture(str(path))
  total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
  idxs = np.linspace(0, max(total - 1, 0), num=num_frames, dtype=np.int32)
  frames: List[np.ndarray] = []
  current = 0
  for target_idx in idxs:
    while current < target_idx and cap.isOpened():
      cap.read()
      current += 1
    ok, frame = cap.read()
    if not ok or frame is None:
      break
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    frame = cv2.resize(frame, (size, size), interpolation=cv2.INTER_LINEAR)
    frames.append(frame.astype(np.float32) / 255.0)
    current += 1
  cap.release()
  if not frames:
    # Fallback to zeros to avoid crashing
    frames = [np.zeros((size, size, 3), dtype=np.float32) for _ in range(num_frames)]
  arr = np.stack(frames, axis=0)
  return arr


def generate_labels_template(root: Optional[Path] = None, attributes: Optional[List[str]] = None) -> Path:
  base = root or get_dataset_root()
  base.mkdir(parents=True, exist_ok=True)
  items = scan_dataset(base)
  attrs = attributes or [
    "attacking", "defending", "technical", "physicality", "endurance"
  ]
  payload = {
    "attributes": attrs,
    "items": [
      {
        "path": str(p.path.relative_to(base).as_posix()),
        "labels": {name: None for name in attrs},
      }
      for p in items
    ],
  }
  out_path = base / "labels.json"
  with out_path.open("w", encoding="utf-8") as f:
    json.dump(payload, f, ensure_ascii=False, indent=2)
  return out_path


def generate_tracking_data_template(root: Optional[Path] = None) -> Path:
  """Generate a template for player tracking data.
  
  Creates a directory structure and example JSON files for tracking data.
  """
  base = root or get_dataset_root()
  base.mkdir(parents=True, exist_ok=True)
  tracking_dir = base / "tracking_data"
  tracking_dir.mkdir(exist_ok=True)
  
  items = scan_dataset(base)
  
  # Create a template file to show the expected format
  template_path = tracking_dir / "_template.json"
  template = {
    "format_version": "1.0",
    "frames": [
      {
        "frame_id": 0,
        "timestamp": 0.0,
        "players": [
          {
            "player_id": 1,
            "position": [100, 200],  # x, y coordinates
            "velocity": [1.5, 0.5],  # velocity vector
            "is_with_ball": True
          },
          {
            "player_id": 2,
            "position": [150, 250],
            "velocity": [-0.5, 1.0],
            "is_with_ball": False
          }
        ],
        "ball": {
          "position": [110, 205],
          "velocity": [1.2, 0.3]
        }
      }
      # Additional frames would follow...
    ]
  }
  
  with template_path.open("w", encoding="utf-8") as f:
    json.dump(template, f, ensure_ascii=False, indent=2)
    
  return tracking_dir


