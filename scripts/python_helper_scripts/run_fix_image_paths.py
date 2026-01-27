"""
Convenience script to run the image path fixer with environment configuration.

This script uses the environment configuration from env.py to run the image path fixer.
"""

import sys
from pathlib import Path

try:
    from env import PROJECT_IDS
except ImportError:
    print("Error: env.py not found. Please copy env.py.template to env.py and configure your project IDs.")
    sys.exit(1)

from fix_image_paths import ImagePathFixer


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Fix image paths using environment configuration')
    parser.add_argument('--env', choices=['npr', 'prd'], default='npr', 
                       help='Environment to use (npr or prd)')
    parser.add_argument('--bucket-name', required=True, 
                       help='Google Cloud Storage bucket name')
    parser.add_argument('--dry-run', action='store_true', 
                       help='Run in dry-run mode (no changes made)')
    parser.add_argument('--verbose', '-v', action='store_true', 
                       help='Enable verbose logging')
    
    args = parser.parse_args()
    
    # Get project ID from environment
    project_id = PROJECT_IDS.get(args.env)
    if not project_id:
        print(f"Error: Project ID not configured for environment '{args.env}' in env.py")
        sys.exit(1)
    
    print(f"Using project ID: {project_id}")
    print(f"Using bucket: {args.bucket_name}")
    print(f"Environment: {args.env}")
    if args.dry_run:
        print("Running in DRY RUN mode")
    
    # Create and run the fixer
    fixer = ImagePathFixer(
        project_id=project_id,
        bucket_name=args.bucket_name,
        dry_run=args.dry_run
    )
    
    if args.verbose:
        import logging
        logging.getLogger().setLevel(logging.DEBUG)
    
    fixer.run()


if __name__ == "__main__":
    main()
