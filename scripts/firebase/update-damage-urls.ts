#!/usr/bin/env node
import admin from "firebase-admin"
import { execSync } from "node:child_process"

function getGcloudProjectId(): string {
  try {
    return execSync("gcloud config get-value project", { encoding: "utf8" }).trim()
  } catch {
    console.error(
      "❌ Failed to get gcloud project ID. Make sure gcloud is installed and configured."
    )
    process.exit(1)
  }
}

const projectId = getGcloudProjectId()

try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: projectId,
    storageBucket: `${projectId}.appspot.com`,
    databaseURL: `https://${projectId}.firebaseio.com`,
  })
  console.log("✅ Successfully initialized Firebase Admin")
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin. Make sure you have run:")
  console.error("   gcloud auth application-default login")
  console.error("   gcloud config set project <your-project-id>")
  console.error("Error details:", error instanceof Error ? error.message : String(error))
  process.exit(1)
}

const db = admin.firestore()

type DamageUpdate = {
  imageUrl?: string
  schematicUrl?: string
  details?: DamageDetail[]
}

type DamageDetail = {
  path?: string
  imageUrl?: string
  [key: string]: unknown // For any additional fields
}

function getStorageUrl(path: string): string {
  // Construct public download URL that respects Firebase Storage rules
  const bucketName = `${projectId}.firebasestorage.app`
  const encodedPath = encodeURIComponent(path)
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`
}

async function updateDamageUrls() {
  try {
    console.log("Starting to update damage documents...")

    // Get all cars
    const carsSnapshot = await db.collection("cars").get()
    const totalCars = carsSnapshot.size
    let processedCars = 0
    let updatedDocuments = 0

    // Process each car
    for (const carDoc of carsSnapshot.docs) {
      const carId = carDoc.id
      processedCars++
      console.log(`Processing car ${processedCars} of ${totalCars} (ID: ${carId})`)

      // Get all damages for this car
      const damagesRef = db.collection("cars").doc(carId).collection("damages")
      const damagesSnapshot = await damagesRef.get()

      if (damagesSnapshot.empty) {
        console.log(`  No damages found for car ${carId}`)
        continue
      }

      console.log(`  Found ${damagesSnapshot.size} damage records for car ${carId}`)

      // Process each damage document
      const batch = db.batch()
      let batchCount = 0
      const BATCH_LIMIT = 400 // Firestore batch limit is 500 operations

      for (const damageDoc of damagesSnapshot.docs) {
        const damageData = damageDoc.data()
        const updates: DamageUpdate = {}
        let needsUpdate = false

        // Update main image URL if path exists
        if (
          damageData.path &&
          (!damageData.imageUrl || damageData.imageUrl !== getStorageUrl(damageData.path))
        ) {
          updates.imageUrl = getStorageUrl(damageData.path)
          needsUpdate = true
        }

        // Update schematic URL if side exists
        if (
          damageData.side &&
          (!damageData.schematicUrl ||
            damageData.schematicUrl !== getStorageUrl(`${carId}_${damageData.side}.png`))
        ) {
          updates.schematicUrl = getStorageUrl(`${carId}_${damageData.side}.png`)
          needsUpdate = true
        }

        // Update damage details with image URLs
        if (Array.isArray(damageData.details)) {
          const updatedDetails = damageData.details.map((detail: DamageDetail) => {
            if (
              detail.path &&
              (!detail.imageUrl || detail.imageUrl !== getStorageUrl(detail.path))
            ) {
              return {
                ...detail,
                imageUrl: getStorageUrl(detail.path),
              }
            }
            return detail
          })

          // Only update if there were changes
          if (JSON.stringify(updatedDetails) !== JSON.stringify(damageData.details)) {
            updates.details = updatedDetails
            needsUpdate = true
          }
        }

        // Add to batch if there are updates
        if (needsUpdate) {
          const docRef = db.collection("cars").doc(carId).collection("damages").doc(damageDoc.id)
          batch.update(docRef, updates)
          batchCount++
          updatedDocuments++

          // Execute batch if we're approaching the limit
          if (batchCount >= BATCH_LIMIT) {
            console.log(`  Committing batch of ${batchCount} updates...`)
            await batch.commit()
            batchCount = 0
          }
        }
      }

      // Commit any remaining operations in the batch
      if (batchCount > 0) {
        console.log(`  Committing final batch of ${batchCount} updates...`)
        await batch.commit()
      }
    }

    console.log("\nUpdate complete!")
    console.log(`Processed ${processedCars} cars`)
    console.log(`Updated ${updatedDocuments} damage documents`)
  } catch (error) {
    console.error("Error updating damage documents:", error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

// Run the update
updateDamageUrls()
