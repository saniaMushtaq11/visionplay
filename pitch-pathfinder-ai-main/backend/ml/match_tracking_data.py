from __future__ import annotations

import argparse
import json
import os
import shutil
from pathlib import Path
from typing import List, Dict, Any, Optional
import cv2
import numpy as np
from tqdm import tqdm

from .config import get_dataset_root, VIDEO_EXTENSIONS


def find_tracking_data_files(tracking_dir: Path) -> List[Path]:
    """Find all tracking data files in the tracking directory.
    
    Args:
        tracking_dir: Directory containing tracking data files
        
    Returns:
        List of paths to tracking data files
    """
    if not tracking_dir.exists():
        raise FileNotFoundError(f"Tracking directory {tracking_dir} does not exist")
    
    # Find all JSON files in the tracking directory
    tracking_files = list(tracking_dir.glob("**/*.json"))
    
    print(f"Found {len(tracking_files)} tracking data files in {tracking_dir}")
    return tracking_files


def find_video_files(clips_dir: Path) -> List[Path]:
    """Find all video files in the clips directory.
    
    Args:
        clips_dir: Directory containing video clips
        
    Returns:
        List of paths to video files
    """
    if not clips_dir.exists():
        raise FileNotFoundError(f"Clips directory {clips_dir} does not exist")
    
    # Find all video files in the clips directory
    video_files = []
    for ext in VIDEO_EXTENSIONS:
        video_files.extend(list(clips_dir.glob(f"**/*{ext}")))
    
    print(f"Found {len(video_files)} video files in {clips_dir}")
    return video_files


def match_clips_with_tracking_data(video_files: List[Path], tracking_files: List[Path]) -> Dict[str, str]:
    """Match video clips with tracking data files.
    
    Args:
        video_files: List of paths to video files
        tracking_files: List of paths to tracking data files
        
    Returns:
        Dictionary mapping video file paths to tracking data file paths
    """
    tracking_filenames = [f.stem for f in tracking_files]
    
    matches = {}
    unmatched_videos = []
    
    # Try to match by filename
    for video_path in tqdm(video_files, desc="Matching clips with tracking data"):
        video_stem = video_path.stem
        matched = False
        
        # Try exact match
        if video_stem in tracking_filenames:
            tracking_idx = tracking_filenames.index(video_stem)
            matches[str(video_path)] = str(tracking_files[tracking_idx])
            matched = True
        else:
            # Try fuzzy match (video filename contains tracking filename or vice versa)
            for i, tracking_stem in enumerate(tracking_filenames):
                if tracking_stem in video_stem or video_stem in tracking_stem:
                    matches[str(video_path)] = str(tracking_files[i])
                    matched = True
                    break
        
        if not matched:
            unmatched_videos.append(video_path)
    
    # Print summary
    print(f"\nMatching Summary:")
    print(f"  Matched: {len(matches)}/{len(video_files)} videos")
    print(f"  Unmatched: {len(unmatched_videos)}/{len(video_files)} videos")
    
    return matches


def copy_tracking_data(matches: Dict[str, str], output_dir: Path) -> int:
    """Copy matched tracking data files to the output directory.
    
    Args:
        matches: Dictionary mapping video file paths to tracking data file paths
        output_dir: Directory to copy tracking data files to
        
    Returns:
        Number of tracking data files copied
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy tracking data files
    copied_count = 0
    for video_path, tracking_path in tqdm(matches.items(), desc="Copying tracking data"):
        # Get the video filename
        video_filename = Path(video_path).name
        video_stem = Path(video_path).stem
        
        # Create the output path
        dst_path = output_dir / f"{video_stem}.json"
        
        # Copy file
        shutil.copy2(tracking_path, dst_path)
        copied_count += 1
    
    print(f"Copied {copied_count} tracking data files to {output_dir}")
    return copied_count


def main():
    parser = argparse.ArgumentParser(description="Match football video clips with tracking data")
    parser.add_argument("--clips_dir", type=Path, required=True, help="Directory containing video clips")
    parser.add_argument("--tracking_dir", type=Path, required=True, help="Directory containing tracking data")
    parser.add_argument("--output_dir", type=Path, default=None, help="Output directory for matched tracking data (default: dataset_root/tracking_data)")
    parser.add_argument("--copy", action="store_true", help="Copy matched tracking data files to output directory")
    args = parser.parse_args()
    
    # Find video files
    video_files = find_video_files(args.clips_dir)
    
    # Find tracking data files
    tracking_files = find_tracking_data_files(args.tracking_dir)
    
    # Match clips with tracking data
    matches = match_clips_with_tracking_data(video_files, tracking_files)
    
    # Determine output directory
    output_dir = args.output_dir
    if output_dir is None:
        output_dir = get_dataset_root() / "tracking_data"
    
    # Save matching information
    matching_path = output_dir.parent / "clip_tracking_matches.json"
    matching_path.parent.mkdir(parents=True, exist_ok=True)
    with matching_path.open("w", encoding="utf-8") as f:
        json.dump(matches, f, ensure_ascii=False, indent=2)
    print(f"Saved matching information to {matching_path}")
    
    # Copy tracking data files if requested
    if args.copy:
        copy_tracking_data(matches, output_dir)
    
    print("\nMatching complete!")
    print(f"Output directory: {output_dir}")
    print("Next steps:")
    print("1. Review the clip_tracking_matches.json file to verify matches")
    print("2. Run the data preparation script: python -m backend.ml.data_prep --clips_dir {args.clips_dir} --tracking_dir {output_dir}")


if __name__ == "__main__":
    main()