from __future__ import annotations

"""
Training entry-point (stub).

Once you provide the dataset, implement:
- Dataset class yielding (video_tensor, labels_dict)
- Model (e.g., Video Transformer or pose-temporal model)
- Multi-task loss for attributes
- Training/validation loop
- Checkpoint saving (pt/onnx) for serving
"""

import argparse
from pathlib import Path
from .config import get_dataset_root
from .dataset import scan_dataset_with_labels
from .trainer import TrainConfig, train_model


def main() -> None:
  parser = argparse.ArgumentParser()
  parser.add_argument("--data_root", type=Path, default=get_dataset_root())
  parser.add_argument("--out_dir", type=Path, default=Path("runs/exp1"))
  parser.add_argument("--epochs", type=int, default=5)
  parser.add_argument("--limit_samples", type=int, default=0, help="Limit number of samples for quick runs (0 = no limit)")
  args = parser.parse_args()
  items, attributes = scan_dataset_with_labels(args.data_root)
  total = len(items)
  labeled = sum(1 for it in items if it.label)
  # Default to new 1..5 star categories if labels.json is empty
  if not attributes:
    attributes = ["attacking", "defending", "technical", "physicality", "endurance"]
  print(f"Dataset: {args.data_root}")
  print(f"Attributes: {attributes}")
  print(f"Videos: {total} (labeled: {labeled})")
  ckpt = train_model(TrainConfig(
    data_root=args.data_root,
    out_dir=args.out_dir,
    attributes=attributes,
    epochs=args.epochs,
    limit_samples=(args.limit_samples or None),
  ))
  print(f"Saved best checkpoint to: {ckpt}")


if __name__ == "__main__":
  main()


