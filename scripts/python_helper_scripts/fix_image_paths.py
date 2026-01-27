"""
Script to check and fix image paths in Firestore for car damage entries.

This script:
1. Checks all damage entries for all cars in Firestore
2. Verifies if image paths follow the pattern: cars/{car_id}/damages/
3. Copies images to the correct path if they're in the wrong location
4. Updates Firestore entries with the new image paths

Usage:
    python fix_image_paths.py --project-id your-project-id --bucket-name your-bucket-name [--dry-run]
"""

import argparse
import logging
from typing import Dict, List, Optional

from google.cloud import firestore, storage
from firebase_util import FirestoreBaseUtil

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ImagePathFixer:
    def __init__(self, project_id: str, bucket_name: str, dry_run: bool = False):
        """
        Initialize the ImagePathFixer.
        
        Args:
            project_id: Firebase project ID
            bucket_name: Google Cloud Storage bucket name
            dry_run: If True, only log what would be done without making changes
        """
        self.project_id = project_id
        self.bucket_name = bucket_name
        self.dry_run = dry_run
        
        # Initialize clients
        self.firestore_util = FirestoreBaseUtil(project_id)
        self.storage_client = storage.Client(project=project_id)
        self.bucket = self.storage_client.bucket(bucket_name)
        
        # Statistics
        self.stats = {
            'cars_checked': 0,
            'damages_checked': 0,
            'images_checked': 0,
            'images_with_wrong_path': 0,
            'images_copied': 0,
            'firestore_updates': 0,
            'errors': 0
        }


    def is_correct_path(self, image_path: str, car_id: str) -> bool:
        """
        Check if the image path follows the correct pattern: cars/{car_id}/damages/
        
        Args:
            image_path: Current image path in storage
            car_id: Car ID
            
        Returns:
            True if path is correct, False otherwise
        """
        expected_prefix = f"cars/{car_id}/damages/"
        return image_path.startswith(expected_prefix)

    def generate_correct_path(self, current_path: str, car_id: str) -> str:
        """
        Generate the correct path for an image.
        
        Args:
            current_path: Current image path
            car_id: Car ID
            
        Returns:
            Correct path following the pattern cars/{car_id}/damages/{filename}
        """
        # Extract filename from current path
        filename = current_path.split('/')[-1]
        return f"cars/{car_id}/damages/{filename}"

    def copy_image_to_correct_path(self, source_path: str, target_path: str) -> bool:
        """
        Copy an image from source path to target path in Google Cloud Storage.
        
        Args:
            source_path: Current image path
            target_path: Target image path
            
        Returns:
            True if copy was successful, False otherwise
        """
        try:
            if self.dry_run:
                logger.info(f"[DRY RUN] Would copy {source_path} to {target_path}")
                return True
            
            # Check if source exists
            source_blob = self.bucket.blob(source_path)
            if not source_blob.exists():
                logger.error(f"Source image does not exist: {source_path}")
                return False
            
            # Check if target already exists
            target_blob = self.bucket.blob(target_path)
            if target_blob.exists():
                logger.info(f"Target already exists, skipping copy: {target_path}")
                return True
            
            # Copy the blob
            self.bucket.copy_blob(source_blob, self.bucket, target_path)
            logger.info(f"Successfully copied {source_path} to {target_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error copying {source_path} to {target_path}: {e}")
            return False


    def update_firestore_damage_entry(self, car_id: str, damage_id: str, updated_data: Dict) -> bool:
        """
        Update a damage entry in Firestore with new data.
        
        Args:
            car_id: Car ID
            damage_id: Damage ID
            updated_data: Updated damage document data
            
        Returns:
            True if update was successful, False otherwise
        """
        try:
            if self.dry_run:
                logger.info(f"[DRY RUN] Would update damage {damage_id} for car {car_id}")
                logger.info(f"[DRY RUN] Updated data: {updated_data}")
                return True
            
            damage_doc_path = f"cars/{car_id}/damages/{damage_id}"
            self.firestore_util.set_doc(damage_doc_path, updated_data)
            
            logger.info(f"Updated Firestore entry for damage {damage_id} in car {car_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating Firestore for damage {damage_id} in car {car_id}: {e}")
            return False

    def process_damage_entry(self, car_id: str, damage_id: str, damage_data: Dict) -> None:
        """
        Process a single damage entry and fix image paths if needed.
        
        Args:
            car_id: Car ID
            damage_id: Damage ID
            damage_data: Damage document data
        """
        self.stats['damages_checked'] += 1
        
        # Track if any changes were made
        changes_made = False
        updated_data = damage_data.copy()
        
        # Process main imagePath field
        if 'imagePath' in damage_data:
            new_path = self.process_image_path(damage_data['imagePath'], car_id)
            if new_path != damage_data['imagePath']:
                updated_data['imagePath'] = new_path
                changes_made = True
        
        # Process details array imagePath fields
        if 'details' in damage_data and isinstance(damage_data['details'], list):
            updated_details = []
            for detail in damage_data['details']:
                updated_detail = detail.copy()
                if 'imagePath' in detail:
                    new_path = self.process_image_path(detail['imagePath'], car_id)
                    if new_path != detail['imagePath']:
                        updated_detail['imagePath'] = new_path
                        changes_made = True
                updated_details.append(updated_detail)
            updated_data['details'] = updated_details
        
        # Process images array (for backward compatibility)
        images = damage_data.get('images', [])
        if images:
            new_image_paths = []
            for image_path in images:
                new_path = self.process_image_path(image_path, car_id)
                new_image_paths.append(new_path)
            
            if new_image_paths != images:
                updated_data['images'] = new_image_paths
                changes_made = True
        
        # Update Firestore if any changes were made
        if changes_made:
            if self.update_firestore_damage_entry(car_id, damage_id, updated_data):
                self.stats['firestore_updates'] += 1
                logger.info(f"Updated damage {damage_id} in car {car_id}")
            else:
                self.stats['errors'] += 1

    def process_image_path(self, image_path: str, car_id: str) -> str:
        """
        Process a single image path and fix it if needed.
        
        Args:
            image_path: Current image path in storage
            car_id: Car ID
            
        Returns:
            Corrected image path
        """
        self.stats['images_checked'] += 1
        
        # Check if path is correct
        if self.is_correct_path(image_path, car_id):
            logger.debug(f"Image path is already correct: {image_path}")
            return image_path
        
        # Path needs fixing
        self.stats['images_with_wrong_path'] += 1
        logger.info(f"Found image with incorrect path: {image_path} (should be in cars/{car_id}/damages/)")
        
        # Generate correct path
        correct_path = self.generate_correct_path(image_path, car_id)
        
        # Copy image to correct location
        if self.copy_image_to_correct_path(image_path, correct_path):
            self.stats['images_copied'] += 1
            logger.info(f"Copied {image_path} to {correct_path}")
            return correct_path
        else:
            self.stats['errors'] += 1
            return image_path  # Keep original if copy failed

    def process_car(self, car_id: str) -> None:
        """
        Process all damage entries for a single car.
        
        Args:
            car_id: Car ID to process
        """
        logger.info(f"Processing car: {car_id}")
        self.stats['cars_checked'] += 1
        
        try:
            # Get all damage documents for this car
            damages_collection_path = f"cars/{car_id}/damages"
            damage_doc_paths = self.firestore_util.list_documents_in_collection(damages_collection_path)
            
            for damage_doc_path in damage_doc_paths:
                damage_id = damage_doc_path.split('/')[-1]
                damage_data = self.firestore_util.get_doc(damage_doc_path)
                
                if damage_data:
                    self.process_damage_entry(car_id, damage_id, damage_data)
                else:
                    logger.warning(f"Could not retrieve damage data for {damage_doc_path}")
                    
        except Exception as e:
            logger.error(f"Error processing car {car_id}: {e}")
            self.stats['errors'] += 1

    def run(self) -> None:
        """
        Main execution method - process all cars and their damage entries.
        """
        logger.info(f"Starting image path fix process for project {self.project_id}")
        if self.dry_run:
            logger.info("Running in DRY RUN mode - no changes will be made")
        
        try:
            # Get all car documents
            cars_collection_path = "cars"
            car_doc_paths = self.firestore_util.list_documents_in_collection(cars_collection_path)
            
            logger.info(f"Found {len(car_doc_paths)} cars to process")
            
            for car_doc_path in car_doc_paths:
                car_id = car_doc_path.split('/')[-1]
                self.process_car(car_id)
            
            # Print final statistics
            self.print_statistics()
            
        except Exception as e:
            logger.error(f"Error in main execution: {e}")
            self.stats['errors'] += 1

    def print_statistics(self) -> None:
        """Print execution statistics."""
        logger.info("=== EXECUTION STATISTICS ===")
        logger.info(f"Cars checked: {self.stats['cars_checked']}")
        logger.info(f"Damage entries checked: {self.stats['damages_checked']}")
        logger.info(f"Images checked: {self.stats['images_checked']}")
        logger.info(f"Images with wrong path: {self.stats['images_with_wrong_path']}")
        logger.info(f"Images copied: {self.stats['images_copied']}")
        logger.info(f"Firestore updates: {self.stats['firestore_updates']}")
        logger.info(f"Errors: {self.stats['errors']}")
        logger.info("============================")


def main():
    parser = argparse.ArgumentParser(description='Fix image paths in Firestore for car damage entries')
    parser.add_argument('--project-id', required=True, help='Firebase project ID')
    parser.add_argument('--bucket-name', required=True, help='Google Cloud Storage bucket name')
    parser.add_argument('--dry-run', action='store_true', help='Run in dry-run mode (no changes made)')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose logging')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Create and run the fixer
    fixer = ImagePathFixer(
        project_id=args.project_id,
        bucket_name=args.bucket_name,
        dry_run=args.dry_run
    )
    
    fixer.run()


if __name__ == "__main__":
    main()
