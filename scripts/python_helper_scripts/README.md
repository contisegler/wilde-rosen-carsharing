# Firebase Helper Scripts

This directory contains Python scripts for managing Firebase Firestore and Google Cloud Storage operations.

## Setup

1. **Install dependencies:**
   ```bash
   uv sync
   ```
   
   If you need additional dependencies (already included):
   ```bash
   uv add google-cloud-storage
   ```

2. **Configure environment:**
   ```bash
   cp env.py.template env.py
   # Edit env.py with your actual Firebase project IDs
   ```

3. **Authenticate with Google Cloud:**
   ```bash
   gcloud auth application-default login
   ```

## Scripts

### Image Path Fixer

The `fix_image_paths.py` script checks and fixes image paths in Firestore for car damage entries. It ensures all images follow the correct path pattern: `cars/{car_id}/damages/`.

#### Features:
- Scans all cars and their damage entries in Firestore
- Identifies images with incorrect paths
- Copies images to the correct location in Google Cloud Storage
- Updates Firestore entries with new image URLs
- Supports dry-run mode for safe testing
- Provides detailed statistics and logging

#### Usage:

**Direct usage:**
```bash
python fix_image_paths.py --project-id your-project-id --bucket-name your-bucket-name [--dry-run] [--verbose]
```

**Using environment configuration:**
```bash
python run_fix_image_paths.py --env npr --bucket-name your-bucket-name [--dry-run] [--verbose]
```

#### Examples:

**Dry run to see what would be changed:**
```bash
python run_fix_image_paths.py --env npr --bucket-name wilde-rosen-carsharing.appspot.com --dry-run --verbose
```

**Actually fix the paths:**
```bash
python run_fix_image_paths.py --env npr --bucket-name wilde-rosen-carsharing.appspot.com --verbose
```

#### Parameters:
- `--env`: Environment (npr or prd) - uses project IDs from env.py
- `--bucket-name`: Google Cloud Storage bucket name
- `--dry-run`: Preview changes without making them
- `--verbose`: Enable detailed logging

### Other Utilities

- `firebase_util.py`: Base utilities for Firestore operations
- Various Jupyter notebooks for specific Firebase operations

## Expected Image Path Structure

The script ensures images follow this structure:
```
cars/
├── kangoo/
│   └── damages/
│       ├── image1.jpg
│       ├── image2.jpg
│       └── ...
├── kona/
│   └── damages/
│       ├── image1.jpg
│       └── ...
└── {other_car_ids}/
    └── damages/
        └── ...
```

## Safety Features

- **Dry run mode**: Test the script without making changes
- **Copy, don't move**: Original images are preserved
- **Detailed logging**: Track all operations and errors
- **Error handling**: Graceful handling of missing files or network issues
- **Statistics**: Summary of operations performed