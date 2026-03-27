from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Dict, Any, List


def load_labels_template(dataset_dir: Path) -> Dict[str, Any]:
    """Load the labels template from the dataset directory.
    
    Args:
        dataset_dir: Path to the dataset directory
        
    Returns:
        Dictionary containing the labels template
    """
    labels_path = dataset_dir / "labels.json"
    if not labels_path.exists():
        raise FileNotFoundError(f"Labels template not found at {labels_path}")
    
    with labels_path.open("r", encoding="utf-8") as f:
        labels = json.load(f)
    
    return labels


def load_categories(dataset_dir: Path) -> Dict[str, List[str]]:
    """Load the video categories from the dataset directory.
    
    Args:
        dataset_dir: Path to the dataset directory
        
    Returns:
        Dictionary mapping categories to lists of video paths
    """
    categories_path = dataset_dir / "categories.json"
    if not categories_path.exists():
        raise FileNotFoundError(f"Categories file not found at {categories_path}")
    
    with categories_path.open("r", encoding="utf-8") as f:
        categories = json.load(f)
    
    return categories


def fill_labels_based_on_categories(labels: Dict[str, Any], categories: Dict[str, List[str]]) -> Dict[str, Any]:
    """Fill in the labels based on the video categories.
    
    Args:
        labels: Dictionary containing the labels template
        categories: Dictionary mapping categories to lists of video paths
        
    Returns:
        Dictionary containing the filled labels
    """
    # Define attribute ratings for each category
    category_ratings = {
        "shooting": {
            "attacking": 0.9,
            "defending": 0.2,
            "technical": 0.8,
            "physicality": 0.7,
            "endurance": 0.5
        },
        "passing": {
            "attacking": 0.7,
            "defending": 0.4,
            "technical": 0.9,
            "physicality": 0.3,
            "endurance": 0.4
        },
        "dribbling": {
            "attacking": 0.8,
            "defending": 0.3,
            "technical": 0.9,
            "physicality": 0.6,
            "endurance": 0.7
        },
        "defending": {
            "attacking": 0.3,
            "defending": 0.9,
            "technical": 0.6,
            "physicality": 0.8,
            "endurance": 0.7
        },
        "pace": {
            "attacking": 0.7,
            "defending": 0.6,
            "technical": 0.5,
            "physicality": 0.8,
            "endurance": 0.9
        },
        "running": {
            "attacking": 0.6,
            "defending": 0.6,
            "technical": 0.4,
            "physicality": 0.8,
            "endurance": 0.9
        }
    }
    
    # Create a mapping from video path to category
    video_to_category = {}
    for category, paths in categories.items():
        for path in paths:
            # Extract the relative path from the full path
            rel_path = Path(path).name
            video_to_category[rel_path] = category
    
    # Fill in the labels based on the video categories
    for item in labels["items"]:
        path = item["path"]
        
        # Try to find the category for this video
        category = None
        
        # First, try to match by exact path
        if path in video_to_category:
            category = video_to_category[path]
        else:
            # Try to match by filename
            filename = Path(path).name
            if filename in video_to_category:
                category = video_to_category[filename]
            else:
                # Try to infer category from path
                for cat in category_ratings.keys():
                    if cat.lower() in path.lower():
                        category = cat
                        break
        
        # If we found a category, fill in the labels
        if category and category in category_ratings:
            for attr, value in category_ratings[category].items():
                if attr in item["labels"]:
                    item["labels"][attr] = value
    
    return labels


def main():
    parser = argparse.ArgumentParser(description="Fill in labels based on video categories")
    parser.add_argument("--dataset_dir", type=Path, default=None, 
                        help="Path to the dataset directory (default: get_dataset_root())")
    args = parser.parse_args()
    
    # Determine dataset directory
    dataset_dir = args.dataset_dir
    if dataset_dir is None:
        from .config import get_dataset_root
        dataset_dir = get_dataset_root()
    
    print(f"Using dataset directory: {dataset_dir}")
    
    # Load labels template
    labels = load_labels_template(dataset_dir)
    print(f"Loaded labels template with {len(labels['items'])} items")
    
    # Load categories
    categories = load_categories(dataset_dir)
    print(f"Loaded categories: {', '.join(categories.keys())}")
    
    # Fill in labels based on categories
    filled_labels = fill_labels_based_on_categories(labels, categories)
    print(f"Filled in labels for {len(filled_labels['items'])} items")
    
    # Save filled labels
    labels_path = dataset_dir / "labels.json"
    with labels_path.open("w", encoding="utf-8") as f:
        json.dump(filled_labels, f, ensure_ascii=False, indent=2)
    print(f"Saved filled labels to {labels_path}")
    
    print("\nNext steps:")
    print("1. Review and adjust the labels.json file if needed")
    print("2. Run the training script: python -m backend.ml.train --data_root {dataset_dir}")


if __name__ == "__main__":
    main()