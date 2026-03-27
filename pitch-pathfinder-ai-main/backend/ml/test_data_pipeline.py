from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional

from .data_prep import setup_dataset_structure, copy_video_files, extract_video_metadata, import_tracking_data, match_clips_with_tracking_data
from .config import get_dataset_root, VIDEO_EXTENSIONS


def test_data_pipeline(clips_dir: Path, tracking_dir: Path, output_dir: Optional[Path] = None, 
                      preserve_categories: bool = True, limit: Optional[int] = None):
    """Test the data preparation pipeline with the provided datasets.
    
    Args:
        clips_dir: Directory containing video clips
        tracking_dir: Directory containing tracking data
        output_dir: Output directory for the dataset (default: get_dataset_root())
        preserve_categories: If True, preserve category subdirectories when copying
        limit: Maximum number of files to process (None for all)
    """
    print("\n===== Testing Data Preparation Pipeline =====")
    print(f"Clips directory: {clips_dir}")
    print(f"Tracking data directory: {tracking_dir}")
    
    # Validate input directories
    if not clips_dir.exists():
        print(f"Error: Clips directory {clips_dir} does not exist")
        return False
    
    if not tracking_dir.exists():
        print(f"Error: Tracking data directory {tracking_dir} does not exist")
        return False
    
    # Set up dataset structure
    target_dir = output_dir or get_dataset_root()
    print(f"\nSetting up dataset structure in {target_dir}")
    target_dir = setup_dataset_structure(clips_dir, target_dir)
    
    # Copy video files
    print("\nCopying video files...")
    video_files = copy_video_files(clips_dir, target_dir, limit, preserve_categories)
    if not video_files:
        print("Error: No video files were copied")
        return False
    
    # Extract video metadata
    print("\nExtracting video metadata...")
    metadata = extract_video_metadata(video_files)
    metadata_path = target_dir / "metadata.json"
    with metadata_path.open("w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    print(f"Saved metadata to {metadata_path}")
    
    # Import tracking data
    print("\nImporting tracking data...")
    tracking_target_dir = target_dir / "tracking_data"
    imported_count = import_tracking_data(tracking_dir, tracking_target_dir)
    if imported_count == 0:
        print("Warning: No tracking data files were imported")
    
    # Match clips with tracking data
    print("\nMatching clips with tracking data...")
    if tracking_target_dir.exists() and any(tracking_target_dir.glob("*.json")):
        matches = match_clips_with_tracking_data(video_files, tracking_target_dir, target_dir)
        if not matches:
            print("Warning: No matches found between clips and tracking data")
    else:
        print("Warning: No tracking data files found to match with clips")
    
    print("\n===== Data Pipeline Test Complete =====")
    print(f"Dataset directory: {target_dir}")
    print("\nNext steps:")
    print("1. Review the metadata.json file to verify video information")
    print("2. Check the clip_tracking_matches.json file to verify matches")
    print("3. Run the training script: python -m backend.ml.train --data_root {target_dir}")
    
    return True


def main():
    parser = argparse.ArgumentParser(description="Test the data preparation pipeline")
    parser.add_argument("--clips_dir", type=Path, default=Path("C:\\clips"), 
                        help="Directory containing video clips (default: C:\\clips)")
    parser.add_argument("--tracking_dir", type=Path, 
                        default=Path("C:\\analysis football\\football_analysis-main\\football_analysis-main"), 
                        help="Directory containing tracking data (default: C:\\analysis football\\football_analysis-main\\football_analysis-main)")
    parser.add_argument("--output_dir", type=Path, default=None, 
                        help="Output directory for the dataset (default: get_dataset_root())")
    parser.add_argument("--no_preserve_categories", action="store_true", 
                        help="Do not preserve category subdirectories when copying")
    parser.add_argument("--limit", type=int, default=None, 
                        help="Maximum number of files to process (None for all)")
    args = parser.parse_args()
    
    success = test_data_pipeline(
        clips_dir=args.clips_dir,
        tracking_dir=args.tracking_dir,
        output_dir=args.output_dir,
        preserve_categories=not args.no_preserve_categories,
        limit=args.limit
    )
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()