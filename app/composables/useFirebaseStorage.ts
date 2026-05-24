import { getStorage, type FirebaseStorage } from 'firebase/storage'
import type { FirebaseApp } from 'firebase/app'

export const useFirebaseStorage = (): FirebaseStorage => {
  const { $firebaseApp } = useNuxtApp()
  return getStorage($firebaseApp as FirebaseApp)
}
