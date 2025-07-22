// Firebase imports
import { doc, collection, query, orderBy } from "firebase/firestore"
import type { FirestoreDataConverter, WithFieldValue, DocumentData } from "firebase/firestore"

interface UseCarDamagesOptions {
  carId: string
}

interface UseCarDamagesReturn {
  car: Ref<CarData | null | undefined>
  damageEntries: Ref<DamageEntry[] | null>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

/**
 * Composable to fetch and manage car data and its damage entries
 */
export function useCarDamages({ carId }: UseCarDamagesOptions): UseCarDamagesReturn {
  const db = useFirestore()
  const error = ref<Error | null>(null)
  const isLoading = ref(true)

  // Create a converter for DamageEntry
  const damageEntryConverter: FirestoreDataConverter<DamageEntry> = {
    toFirestore: (entry: WithFieldValue<DamageEntry>): DocumentData => {
      const { id, schematicPath, ...data } = entry as DamageEntry
      return data
    },
    fromFirestore: (snapshot, options): DamageEntry => {
      const data = snapshot.data(options) as DamageEntry
      data.id = snapshot.id
      data.schematicPath = `${carId}_${data.side}.png`
      return data
    },
  }

  // Create a converter for CarData
  const carConverter: FirestoreDataConverter<CarData> = {
    toFirestore: (car: WithFieldValue<CarData>): DocumentData => {
      const { id, ...data } = car as CarData
      return data
    },
    fromFirestore: (snapshot, options): CarData => {
      const data = snapshot.data(options) as CarData
      data.id = snapshot.id
      return data
    },
  }

  // Fetch car data
  const {
    data: car,
    error: carError,
    pending: isCarLoading,
  } = useDocument<CarData>(doc(db, "cars", carId).withConverter(carConverter), { once: true })

  // Fetch damage entries ordered by the 'order' field
  const {
    data: damageEntries,
    error: damagesError,
    pending: isDamagesLoading,
  } = useCollection<DamageEntry>(
    query(
      collection(db, "cars", carId, "damages").withConverter(damageEntryConverter),
      orderBy("order")
    ),
    { once: true, ssrKey: `car-damages-${carId}` }
  )

  // Handle errors and loading states
  watchEffect(() => {
    if (carError.value) {
      error.value = carError.value
      isLoading.value = false
    } else if (damagesError.value) {
      error.value = damagesError.value
      isLoading.value = false
    } else {
      isLoading.value = isCarLoading.value || isDamagesLoading.value
    }
  })

  return { car, damageEntries, isLoading, error }
}
