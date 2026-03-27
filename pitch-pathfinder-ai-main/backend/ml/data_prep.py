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
from .dataset import generate_labels_template, generate_tracking_data_template


def setup_dataset_structure(source_dir: Path, target_dir: Optional[Path] = None) -> Path:
    """Set up the dataset directory structure.
    
    Args:
        source_dir: Directory containing source video clips
        target_dir: Target directory for the dataset (default: get_dataset_root())
        
    Returns:
        Path to the dataset directory
    """
    target = target_dir or get_dataset_root()
    target.mkdir(parents=True, exist_ok=True)
    
    # Create tracking_data directory
    tracking_dir = target / "tracking_data"
    tracking_dir.mkdir(exist_ok=True)
    
    return target


def copy_video_files(source_dir: Path, target_dir: Path, limit: Optional[int] = None, 
                     preserve_categories: bool = False) -> List[Path]:
    """Copy video files from source directory to target directory.
    
    Args:
        source_dir: Directory containing source video clips
        target_dir: Target directory for the dataset
        limit: Maximum number of files to copy (None for all)
        preserve_categories: If True, preserve category subdirectories
        
    Returns:
        List of paths to copied video files
    """
    if not source_dir.exists():
        raise FileNotFoundError(f"Source directory {source_dir} does not exist")
    
    # Find all video files in source directory
    video_files = []
    for ext in VIDEO_EXTENSIONS:
        video_files.extend(list(source_dir.glob(f"**/*{ext}")))
    
    # Limit number of files if specified
    if limit is not None:
        video_files = video_files[:limit]
    
    # Copy files to target directory
    copied_files = []
    for src_path in tqdm(video_files, desc="Copying video files"):
        # Create relative path structure in target directory
        if preserve_categories:
            # Preserve the category directory structure
            rel_path = src_path.relative_to(source_dir)
            dst_path = target_dir / rel_path
        else:
            # Just copy to the root of the target directory
            dst_path = target_dir / src_path.name
        
        # Create parent directories if they don't exist
        dst_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Copy file
        shutil.copy2(src_path, dst_path)
        copied_files.append(dst_path)
    
    print(f"Copied {len(copied_files)} video files to {target_dir}")
    return copied_files


def extract_video_metadata(video_files: List[Path]) -> Dict[str, Dict[str, Any]]:
    """Extract metadata from video files.
    
    Args:
        video_files: List of paths to video files
        
    Returns:
        Dictionary mapping video file paths to metadata
    """
    metadata = {}
    for path in tqdm(video_files, desc="Extracting video metadata"):
        try:
            cap = cv2.VideoCapture(str(path))
            if not cap.isOpened():
                print(f"Warning: Could not open video file {path}")
                continue
                
            # Extract basic metadata
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = frame_count / fps if fps > 0 else 0
            
            # Extract a thumbnail frame
            cap.set(cv2.CAP_PROP_POS_FRAMES, min(10, frame_count - 1))
            ret, frame = cap.read()
            has_thumbnail = ret and frame is not None
            
            cap.release()
            
            # Determine category from path if possible
            category = None
            path_parts = path.parts
            for part in path_parts:
                if part.lower() in ["shooting", "passing", "dribbling", "defending", "pace", "running"]:
                    category = part.lower()
                    break
            
            metadata[str(path)] = {
                "width": width,
                "height": height,
                "fps": fps,
                "frame_count": frame_count,
                "duration": duration,
                "has_thumbnail": has_thumbnail,
                "category": category
            }
        except Exception as e:
            print(f"Error extracting metadata from {path}: {e}")
    
    return metadata


def categorize_videos(video_files: List[Path], categories: List[str]) -> Dict[str, List[Path]]:
    """Interactively categorize videos.
    
    Args:
        video_files: List of paths to video files
        categories: List of categories to assign videos to
        
    Returns:
        Dictionary mapping categories to lists of video files
    """
    categorized = {cat: [] for cat in categories}
    
    # First, try to auto-categorize based on directory structure
    auto_categorized = 0
    for path in video_files:
        path_parts = path.parts
        for cat in categories:
            if cat.lower() in [part.lower() for part in path_parts]:
                categorized[cat].append(path)
                auto_categorized += 1
                break
    
    if auto_categorized > 0:
        print(f"\nAuto-categorized {auto_categorized}/{len(video_files)} videos based on directory structure.")
        print("Remaining videos will be categorized interactively.")
    
    # Filter out already categorized videos
    already_categorized = set()
    for files in categorized.values():
        already_categorized.update(files)
    
    remaining = [path for path in video_files if path not in already_categorized]
    
    if not remaining:
        print("All videos have been auto-categorized.")
        return categorized
    
    print("\nVideo Categorization")
    print("====================")
    print(f"Categories: {', '.join(categories)}")
    print("For each video, enter the category number or 's' to skip.")
    
    for i, path in enumerate(remaining):
        print(f"\nVideo {i+1}/{len(remaining)}: {path.name}")
        for j, cat in enumerate(categories):
            print(f"  {j+1}. {cat}")
        
        choice = input("Enter category number (or 's' to skip): ")
        if choice.lower() == 's':
            continue
        
        try:
            idx = int(choice) - 1
            if 0 <= idx < len(categories):
                categorized[categories[idx]].append(path)
            else:
                print("Invalid category number, skipping.")
        except ValueError:
            print("Invalid input, skipping.")
    
    # Print summary
    print("\nCategorization Summary:")
    for cat, files in categorized.items():
        print(f"  {cat}: {len(files)} videos")
    
    return categorized


def import_tracking_data(tracking_src_dir: Path, target_tracking_dir: Path) -> int:
    """Import tracking data from the source directory to the target tracking_data directory.
    
    Args:
        tracking_src_dir: Directory containing tracking data
        target_tracking_dir: Target directory for tracking data
        
    Returns:
        Number of tracking data files imported
    """
    if not tracking_src_dir.exists():
        print(f"Warning: Tracking data source directory {tracking_src_dir} does not exist")
        return 0
    
    # Find all tracking data files (JSON files)
    tracking_files = list(tracking_src_dir.glob("**/*.json"))
    
    # Copy files to target directory
    imported_count = 0
    for src_path in tqdm(tracking_files, desc="Importing tracking data"):
        # Just copy to the root of the target tracking directory
        dst_path = target_tracking_dir / src_path.name
        
        # Copy file
        shutil.copy2(src_path, dst_path)
        imported_count += 1
    
    print(f"Imported {imported_count} tracking data files to {target_tracking_dir}")
    return imported_count


def match_clips_with_tracking_data(video_files: List[Path], tracking_dir: Path, 
                                  output_dir: Path) -> Dict[str, str]:
    """Match video clips with tracking data files.
    
    Args:
        video_files: List of paths to video files
        tracking_dir: Directory containing tracking data files
        output_dir: Directory to output the matching information
        
    Returns:
        Dictionary mapping video file paths to tracking data file paths
    """
    # Get all tracking data files
    tracking_files = list(tracking_dir.glob("*.json"))
    tracking_filenames = [f.stem for f in tracking_files]
    
    matches = {}
    unmatched_videos = []
    
    # Try to match by filename
    for video_path in video_files:
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
    
    # Save matching information
    matching_path = output_dir / "clip_tracking_matches.json"
    with matching_path.open("w", encoding="utf-8") as f:
        json.dump(matches, f, ensure_ascii=False, indent=2)
    
    print(f"\nMatching Summary:")
    print(f"  Matched: {len(matches)}/{len(video_files)} videos")
    print(f"  Unmatched: {len(unmatched_videos)}/{len(video_files)} videos")
    print(f"Saved matching information to {matching_path}")
    
    return matches


def main():
    parser = argparse.ArgumentParser(description="Prepare football video clips for training")
    parser.add_argument("--source", type=Path, help="Directory containing source video clips")
    parser.add_argument("--clips_dir", type=Path, help="Directory containing categorized clips (C:\\clips)")
    parser.add_argument("--tracking_dir", type=Path, help="Directory containing tracking data")
    parser.add_argument("--target", type=Path, default=None, help="Target directory for the dataset (default: get_dataset_root())")
    parser.add_argument("--limit", type=int, default=None, help="Maximum number of files to process")
    parser.add_argument("--skip_copy", action="store_true", help="Skip copying files (use existing files in target directory)")
    parser.add_argument("--skip_categorization", action="store_true", help="Skip interactive categorization")
    parser.add_argument("--preserve_categories", action="store_true", help="Preserve category subdirectories when copying")
    args = parser.parse_args()
    
    # Validate arguments
    if not args.source and not args.clips_dir and not args.skip_copy:
        parser.error("Either --source or --clips_dir must be provided unless --skip_copy is used")
    
    # Set up dataset structure
    source_dir = args.source if args.source else (args.clips_dir if args.clips_dir else Path("."))
    target_dir = setup_dataset_structure(source_dir, args.target)
    
    # Copy video files
    if args.skip_copy:
        # Find existing video files in target directory
        video_files = []
        for ext in VIDEO_EXTENSIONS:
            video_files.extend(list(target_dir.glob(f"**/*{ext}")))
        print(f"Found {len(video_files)} existing video files in {target_dir}")
    else:
        # Copy from regular source directory
        if args.source:
            video_files = copy_video_files(args.source, target_dir, args.limit, False)
        
        # Copy from categorized clips directory
        if args.clips_dir:
            # If clips_dir is provided, it has a specific structure with category subdirectories
            clips_dir = args.clips_dir
            if clips_dir.exists():
                video_files = copy_video_files(clips_dir, target_dir, args.limit, args.preserve_categories)
            else:
                print(f"Warning: Clips directory {clips_dir} does not exist")
    
    # Extract video metadata
    metadata = extract_video_metadata(video_files)
    metadata_path = target_dir / "metadata.json"
    with metadata_path.open("w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    print(f"Saved metadata to {metadata_path}")
    
    # Import tracking data if provided
    tracking_dir = target_dir / "tracking_data"
    if args.tracking_dir and args.tracking_dir.exists():
        import_tracking_data(args.tracking_dir, tracking_dir)
    
    # Match clips with tracking data
    if tracking_dir.exists() and any(tracking_dir.glob("*.json")):
        match_clips_with_tracking_data(video_files, tracking_dir, target_dir)
    
    # Categorize videos if not already categorized by directory structure
    if not args.skip_categorization:
        # Extract categories from metadata if possible
        auto_categories = set()
        for meta in metadata.values():
            if meta.get("category"):
                auto_categories.add(meta["category"])
        
        # Add default categories if needed
        categories = list(auto_categories) if auto_categories else ["shooting", "passing", "dribbling", "defending", "running"]
        categorized = categorize_videos(video_files, categories)
        
        # Save categorization
        categorization_path = target_dir / "categories.json"
        with categorization_path.open("w", encoding="utf-8") as f:
            # Convert Path objects to strings for JSON serialization
            serializable = {cat: [str(p) for p in paths] for cat, paths in categorized.items()}
            json.dump(serializable, f, ensure_ascii=False, indent=2)
        print(f"Saved categorization to {categorization_path}")
    
    # Generate templates
    labels_path = generate_labels_template(target_dir)
    print(f"Generated labels template at {labels_path}")
    
    tracking_template_dir = generate_tracking_data_template(target_dir)
    print(f"Generated tracking data template at {tracking_template_dir}")
    
    print("\nData preparation complete!")
    print(f"Dataset directory: {target_dir}")
    print("Next steps:")
    print("1. Fill in the labels.json file with attribute ratings for each video")
    print("2. Create tracking data JSON files for each video in the tracking_data directory")
    print("3. Run the training script: python -m backend.ml.train --data_root {target_dir}")


if __name__ == "__main__":
    main()