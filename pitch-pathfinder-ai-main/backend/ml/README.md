# Football Player Attribute Assessment ML System

## Overview

This ML system analyzes football (soccer) video clips to assess player attributes such as attacking, defending, technical skills, physicality, and endurance. The system can process both video data and player tracking data to provide more accurate assessments.

## Features

- Video-based player attribute assessment
- Integration with player tracking data
- Support for processing multiple video clips
- Customizable attribute categories
- Training and inference pipelines

## Getting Started

### Prerequisites

- Python 3.8+
- PyTorch 1.8+
- OpenCV
- NumPy
- tqdm

### Data Organization

The system expects data to be organized in the following structure:

```
<dataset_root>/
  ├── video1.mp4
  ├── video2.mp4
  ├── ...
  ├── labels.json
  └── tracking_data/
      ├── video1.json
      ├── video2.json
      └── ...
```

You can use the provided `data_prep.py` script to set up this structure automatically.

## Video Clips

### Requirements

- Format: MP4, AVI, MOV, MKV, WEBM, or M4V
- Content: Football/soccer gameplay showing player actions
- Recommended length: 5-30 seconds per clip
- Recommended categories:

## Implementation Details

### Model Architecture

The system uses a 3D CNN architecture to process video frames and extract spatio-temporal features. The model consists of:

1. **Simple3DCNN Backbone**: A 3D convolutional neural network that processes video frames
2. **AttributeRegressor**: A regression head that predicts player attribute scores

The model can optionally incorporate player tracking data to improve prediction accuracy.

### Training Pipeline

The training pipeline includes:

1. **VideoDataset**: Loads and preprocesses video clips and tracking data
2. **Data Augmentation**: Handles videos of different lengths through padding/sampling
3. **Training Loop**: Uses AdamW optimizer and MSE loss for attribute regression
4. **Validation**: Evaluates model performance on a validation set

## Usage

### Training

To train the model on your dataset:

```bash
python -m backend.ml.train --data_root "path/to/dataset" --epochs 5
```

Options:
- `--data_root`: Path to the dataset directory
- `--out_dir`: Output directory for checkpoints (default: runs/exp1)
- `--epochs`: Number of training epochs (default: 5)
- `--limit_samples`: Limit number of samples for quick testing (default: 0, no limit)

### Inference

To run inference on new videos:

```bash
python -m backend.ml.inference --video "path/to/video.mp4" --checkpoint "runs/exp1/best.pt"
```

## Troubleshooting

### Empty Dataset

If the dataset directory is empty or doesn't contain valid videos, the system will create dummy data to prevent errors. This is useful for testing the pipeline without real data.

### Video Frame Consistency

The system automatically handles videos with different numbers of frames by padding shorter videos and sampling from longer ones to ensure consistent tensor dimensions.

## Future Improvements

- Implement more sophisticated 3D CNN architectures (e.g., I3D, SlowFast)
- Add support for transformer-based video understanding
- Improve tracking data integration
- Implement more advanced data augmentation techniques
- Add support for multi-GPU training

### Organization Tips

1. **Consistent Perspective**: Try to use clips with similar camera angles for better results
2. **Focus on Player**: Ensure the player being assessed is clearly visible
3. **Action Completion**: Include complete actions (e.g., full pass sequence)
4. **Variety**: Include a variety of scenarios for comprehensive assessment

## Player Tracking Data

The system can incorporate player tracking data to improve assessment accuracy. Tracking data should be provided as JSON files in the `tracking_data/` directory, with filenames matching the video filenames (without extension).

### Tracking Data Format

```json
{
  "format_version": "1.0",
  "frames": [
    {
      "frame_id": 0,
      "timestamp": 0.0,
      "players": [
        {
          "player_id": 1,
          "position": [100, 200],
          "velocity": [1.5, 0.5],
          "is_with_ball": true
        },
        {
          "player_id": 2,
          "position": [150, 250],
          "velocity": [-0.5, 1.0],
          "is_with_ball": false
        }
      ],
      "ball": {
        "position": [110, 205],
        "velocity": [1.2, 0.3]
      }
    }
    // Additional frames...
  ]
}
```

### Key Fields

- `frame_id`: Sequential frame identifier
- `timestamp`: Time in seconds from the start of the video
- `players`: Array of player objects
  - `player_id`: Unique identifier for the player
  - `position`: [x, y] coordinates on the field
  - `velocity`: [vx, vy] velocity vector
  - `is_with_ball`: Boolean indicating if the player has the ball
- `ball`: Object containing ball position and velocity

## Labels

Player attribute labels are stored in `labels.json` at the root of the dataset directory. This file maps video files to attribute ratings.

### Labels Format

```json
{
  "attributes": ["attacking", "defending", "technical", "physicality", "endurance"],
  "items": [
    {
      "path": "video1.mp4",
      "labels": {
        "attacking": 4,
        "defending": 3,
        "technical": 5,
        "physicality": 4,
        "endurance": 3
      }
    },
    // Additional items...
  ]
}
```

## Usage

### Data Preparation

Use the data preparation script to set up your dataset:

```bash
python -m backend.ml.data_prep --source /path/to/video/clips --target /path/to/dataset
```

Options:
- `--source`: Directory containing source video clips (required)
- `--target`: Target directory for the dataset (default: get_dataset_root())
- `--limit`: Maximum number of files to process
- `--skip_copy`: Skip copying files (use existing files in target directory)
- `--skip_categorization`: Skip interactive categorization

### Training

Train the model on your dataset:

```bash
python -m backend.ml.train --data_root /path/to/dataset --epochs 10
```

Options:
- `--data_root`: Path to the dataset directory (default: get_dataset_root())
- `--out_dir`: Output directory for checkpoints (default: runs/exp1)
- `--epochs`: Number of training epochs (default: 5)
- `--limit_samples`: Limit number of samples for quick runs (0 = no limit)

### Inference

The system automatically uses the trained model for inference when available. The model will assess player attributes from video clips and return ratings on a scale of 1-5 stars.

## Customization

### Adding New Attributes

To add new attributes, modify the `attributes` list in `labels.json` and update your labels accordingly. The system will automatically adapt to the new attributes during training.

### Advanced Tracking Data

For more advanced tracking data, you can extend the tracking data format with additional fields. Update the `_extract_frame_features` method in `VideoDataset` to process the new fields.

## Troubleshooting

### Common Issues

1. **Missing tracking data**: If tracking data is missing for a video, the system will fall back to using only video data.
2. **Incompatible video format**: Ensure your videos are in a supported format (MP4, AVI, MOV, MKV, WEBM, M4V).
3. **Low-quality predictions**: Try providing more labeled examples or improving the quality of your tracking data.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.