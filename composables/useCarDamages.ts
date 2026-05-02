// Firebase imports
import { doc, collection } from "firebase/firestore"
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

  // Helper function to get side index for sorting
  const getSideIndex = (side: CarSide): number => {
    const sideOrder: Record<CarSide, number> = {
      left: 0,
      back: 1,
      right: 2,
      front: 3,
      top: 4,
    }
    return sideOrder[side] ?? 5
  }

  // Create a converter for DamageEntry
  const damageEntryConverter: FirestoreDataConverter<DamageEntry> = {
    toFirestore: (entry: WithFieldValue<DamageEntry>): DocumentData => {
      const { id, schematicPath, sideIndex, ...data } = entry as DamageEntry
      return data
    },
    fromFirestore: (snapshot, options): DamageEntry => {
      const rawData = snapshot.data(options)
      
      // Convert Firestore Timestamps to JavaScript Dates
      const entry: DamageEntry = {
        ...(rawData as Omit<DamageEntry, 'id' | 'schematicPath' | 'sideIndex' | 'createdAt' | 'updatedAt'>),
        id: snapshot.id,
        schematicPath: `cars/${carId}/schematics/${carId}_${rawData.side}.png`,
        sideIndex: getSideIndex(rawData.side as CarSide),
        createdAt: rawData.createdAt?.toDate?.() || undefined,
        updatedAt: rawData.updatedAt?.toDate?.() || undefined,
      }
      
      // Lazy migration: set updatedAt from createdAt if missing, or use current date
      if (!entry.updatedAt) {
        entry.updatedAt = entry.createdAt || new Date()
      }
      
      return entry
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

  // Fetch damage entries without Firestore ordering
  const {
    data: rawDamageEntries,
    error: damagesError,
    pending: isDamagesLoading,
  } = useCollection<DamageEntry>(
    collection(db, "cars", carId, "damages").withConverter(damageEntryConverter),
    { once: true, ssrKey: `car-damages-${carId}` }
  )

  // Sort damage entries by side (using sideIndex) and then by x value
  const damageEntries = computed(() => {
    if (!rawDamageEntries.value) return null
    
    return [...rawDamageEntries.value]
      .filter((entry) => !entry.isArchive)
      .sort((a, b) => {
        // First sort by side index
        if (a.sideIndex !== b.sideIndex) {
          return a.sideIndex - b.sideIndex
        }
        // Then sort by x value
        return a.x - b.x
      })
  })

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
