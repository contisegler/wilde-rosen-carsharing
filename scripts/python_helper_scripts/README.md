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