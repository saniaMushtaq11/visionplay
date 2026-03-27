from __future__ import annotations

import os
from pathlib import Path


def get_dataset_root() -> Path:
  # Allow override via env var DATASET_ROOT. Fallback to provided Windows path.
  env_path = os.getenv("DATASET_ROOT")
  if env_path:
    return Path(env_path)
  # Default path provided by the user
  return Path(r"C:\VisionPlay\football match action video dataset")


VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm", ".m4v"}


