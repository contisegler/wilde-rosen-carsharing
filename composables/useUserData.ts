import { doc } from "firebase/firestore"
import type { FirestoreDataConverter, WithFieldValue, DocumentData } from "firebase/firestore"

interface UserData {
  id?: string
  damage_reporter?: boolean
  email?: string
  displayName?: string
}

interface UseUserDataOptions {
  userId: string
}

interface UseUserDataReturn {
  userData: Ref<UserData | null | undefined>
  isDamageReporter: ComputedRef<boolean>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

/**
 * Composable to fetch and manage user data from Firebase
 */
export function useUserData({ userId }: UseUserDataOptions): UseUserDataReturn {
  const db = useFirestore()
  const error = ref<Error | null>(null)
  const isLoading = ref(true)

  // Create a converter for UserData
  const userConverter: FirestoreDataConverter<UserData> = {
    toFirestore: (user: WithFieldValue<UserData>): DocumentData => {
      const { id, ...data } = user as UserData
      return data
    },
    fromFirestore: (snapshot, options): UserData => {
      const data = snapshot.data(options) as UserData
      data.id = snapshot.id
      return data
    },
  }

  // Fetch user data
  const {
    data: userData,
    error: userError,
    pending: isUserLoading,
  } = useDocument<UserData>(doc(db, "users", userId).withConverter(userConverter), { once: true })

  // Computed property to check if user is a damage reporter
  const isDamageReporter = computed(() => {
    return userData.value?.damage_reporter === true
  })

  // Handle errors and loading states
  watchEffect(() => {
    if (userError.value) {
      error.value = userError.value
      isLoading.value = false
    } else {
      isLoading.value = isUserLoading.value
    }
  })

  return { userData, isDamageReporter, isLoading, error }
}
