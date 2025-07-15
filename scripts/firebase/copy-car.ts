#!/usr/bin/env node

// Using default import for Firebase Admin
import admin from 'firebase-admin';
import { program } from 'commander';
import { execSync } from 'node:child_process';

/**
 * Gets the current gcloud project ID
 */
function getGcloudProjectId(): string {
  try {
    return execSync('gcloud config get-value project', { encoding: 'utf8' }).trim();
  } catch {
    console.error('❌ Failed to get gcloud project ID. Make sure gcloud is installed and configured.');
    process.exit(1);
  }
}

// Get the project ID from gcloud config
const projectId = getGcloudProjectId();

// Initialize Firebase Admin
try {
  // Initialize with explicit credential
  await admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: projectId,
    databaseURL: `https://${projectId}.firebaseio.com`
  });
  
  console.log('✅ Successfully initialized Firebase Admin');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin. Make sure you have run:');
  console.error('   gcloud auth application-default login');
  console.error('   gcloud config set project <your-project-id>');
  console.error('Error details:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const _db = admin.firestore();

/**
 * Copies a Firestore document to a new document with a different ID
 * @param sourceRef - Reference to the source document
 * @param destRef - Reference to the destination document
 */
async function copyDocument(
  sourceCarId: string,
  destCarId: string
): Promise<void> {
  try {
    // Get the document data
    const docSnapshot = await _db.collection('cars').doc(sourceCarId).get();
    
    if (!docSnapshot.exists) {
      throw new Error(`Source document does not exist at path: cars/${sourceCarId}`);
    }
    
    // Copy the document data
    const docData = docSnapshot.data();
    if (!docData) {
      throw new Error(`No data found in document: cars/${sourceCarId}`);
    }
    
    await _db.collection('cars').doc(destCarId).set(docData);
    console.log(`✅ Successfully copied car base info from ${sourceCarId} to ${destCarId}`);

    // Copy the damage entries
    const damageEntriesSnapshot = await _db.collection('cars').doc(sourceCarId).collection('damages').get();
    
    if (!damageEntriesSnapshot.empty) {
      // Use a batch to copy all damage entries in a single operation
      const batch = _db.batch();
      const destCollectionRef = _db.collection('cars').doc(destCarId).collection('damages');
      
      // Add each damage entry to the batch
      damageEntriesSnapshot.docs.forEach(doc => {
        const docData = doc.data();
        if (docData) {
          // Create a new document reference with the same ID as the source
          const newDocRef = destCollectionRef.doc(doc.id);
          batch.set(newDocRef, docData);
        }
      });
      
      // Commit the batch
      await batch.commit();
      console.log(`✅ Successfully copied ${damageEntriesSnapshot.size} damage entries from ${sourceCarId} to ${destCarId}`);
    } else {
      console.log('ℹ️ No damage entries found to copy');
    }
    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error copying document:', errorMessage);
    process.exit(1);
  }
}

// Set up command line interface
program
  .name('copy-car')
  .description('Copy a car document to a new document with a different ID')
  .requiredOption('-s, --source <carId>', 'Source car ID')
  .requiredOption('-d, --destination <carId>', 'Destination car ID')
  .action((options: { source: string; destination: string }) => {
    try {
      copyDocument(options.source, options.destination);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Error: ${errorMessage}`);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);
