import { ref as storageRef, uploadBytes, getDownloadURL, listAll, getMetadata, deleteObject } from 'firebase/storage'
import type { StorageFile } from '~~/shared/types'

export function useFirebaseStorageUpload(storagePath: string) {
  const uploading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Upload a file to Firebase Storage
   */
  async function uploadFile(file: File): Promise<StorageFile | null> {
    try {
      uploading.value = true
      error.value = null
      
      const storage = useFirebaseStorage()
      const timestamp = Date.now()
      const fileName = `${timestamp}_${file.name}`
      const path = `${storagePath}/${fileName}`
      const fileRef = storageRef(storage, path)
      
      await uploadBytes(fileRef, file)
      const url = await getDownloadURL(fileRef)
      
      return {
        url,
        fullPath: path,
        name: file.name,
      }
    } catch (err) {
      console.error('Upload error:', err)
      error.value = 'Fehler beim Hochladen'
      return null
    } finally {
      uploading.value = false
    }
  }

  /**
   * Upload multiple files to Firebase Storage
   */
  async function uploadFiles(files: File[]): Promise<StorageFile[]> {
    const uploadPromises = files.map(file => uploadFile(file))
    const results = await Promise.all(uploadPromises)
    return results.filter((result): result is StorageFile => result !== null)
  }

  /**
   * List all files in the storage path
   */
  async function listFiles(): Promise<StorageFile[]> {
    if (!import.meta.client) {
      console.warn('listFiles called on server side, returning empty array')
      return []
    }

    try {
      const storage = useFirebaseStorage()
      const storageReference = storageRef(storage, storagePath)
      
      console.log('Listing files from path:', storagePath)
      const result = await listAll(storageReference)
      console.log('Found items:', result.items.length)

      if (result.items.length === 0) {
        return []
      }

      const imagePromises = result.items.map(async item => {
        try {
          const url = await getDownloadURL(item)
          const metadata = await getMetadata(item)

          return {
            name: item.name,
            url,
            fullPath: item.fullPath,
            size: metadata.size,
            timeCreated: metadata.timeCreated,
          } as StorageFile
        } catch (err) {
          console.error('Error loading item:', item.name, err)
          return null
        }
      })

      const results = await Promise.all(imagePromises)
      return results.filter((result): result is StorageFile => result !== null)
    } catch (err) {
      console.error('Error listing files from', storagePath, ':', err)
      error.value = 'Fehler beim Laden der Dateien'
      return []
    }
  }

  /**
   * Delete a file from Firebase Storage
   */
  async function deleteFile(fullPath: string): Promise<boolean> {
    try {
      const storage = useFirebaseStorage()
      const fileRef = storageRef(storage, fullPath)
      await deleteObject(fileRef)
      return true
    } catch (err) {
      console.error('Error deleting file:', err)
      error.value = 'Fehler beim Löschen'
      return false
    }
  }

  /**
   * Get download URL for a file
   */
  async function getFileUrl(fullPath: string): Promise<string | null> {
    try {
      const storage = useFirebaseStorage()
      const fileRef = storageRef(storage, fullPath)
      return await getDownloadURL(fileRef)
    } catch (err) {
      console.error('Error getting file URL:', err)
      return null
    }
  }

  return {
    uploading,
    error,
    uploadFile,
    uploadFiles,
    listFiles,
    deleteFile,
    getFileUrl,
  }
}
