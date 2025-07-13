// Firebase imports
import { doc, collection, query, orderBy } from "firebase/firestore"
import { ref as storageRef } from "firebase/storage"
import type { FirestoreDataConverter, WithFieldValue, Timestamp } from "firebase/firestore"

interface UseCarDamagesOptions {
  carId: string
}

type FirestoreDamageEntry = Omit<DamageEntryBase, "id" | "createdAt" | "updatedAt"> & {
  createdAt: Timestamp
  updatedAt: Timestamp
}

type FirestoreCarData = Omit<CarData, "id">

interface UseCarDamagesReturn {
  car: Ref<CarData | null>
  damageEntries: Ref<DamageEntry[] | null>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

/**
 * Composable to fetch and manage car data and its damage entries
 */
export function useCarDamages({ carId }: UseCarDamagesOptions): UseCarDamagesReturn {
  console.log("useCarDamages called with carId:", carId)
  const db = useFirestore()
  const error = ref<Error | null>(null)
  const isLoading = ref(true)

  // Get VueFire storage instance
  const storage = useFirebaseStorage()

  // Helper function to generate storage URLs
  async function getStorageUrls(
    carId: string,
    entry: DamageEntryBase
  ): Promise<{ imageUrl: string; schematicUrl: string }> {
    try {
      const imageRef = storageRef(storage, entry.path)
      const schematicRef = storageRef(storage, `${carId}_${entry.side}.png`)

      const [imageUrl, schematicUrl] = await Promise.all([
        useStorageFileUrl(imageRef).url.value || "",
        useStorageFileUrl(schematicRef).url.value || "",
      ])

      return { imageUrl, schematicUrl }
    } catch (err) {
      console.error("Error generating storage URLs:", err)
      return { imageUrl: "", schematicUrl: "" }
    }
  }

  // Create a Firestore data converter
  const damageEntryConverter: FirestoreDataConverter<DamageEntryBase, FirestoreDamageEntry> = {
    toFirestore: (entry: WithFieldValue<DamageEntryBase>): FirestoreDamageEntry => {
      const { id, createdAt, updatedAt, ...data } = entry as DamageEntryBase
      return {
        ...data,
        createdAt: createdAt as unknown as Timestamp,
        updatedAt: updatedAt as unknown as Timestamp,
      }
    },
    fromFirestore: (snapshot, options): DamageEntryBase => {
      const data = snapshot.data(options)
      return {
        id: snapshot.id,
        path: data.path,
        description: data.description || "",
        x: data.x || 0,
        y: data.y || 0,
        side: data.side || "front",
        details: data.details || [],
        order: data.order || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    },
  }

  // Create a converter for CarData
  const carConverter: FirestoreDataConverter<CarData, FirestoreCarData> = {
    toFirestore: (car: WithFieldValue<CarData>): FirestoreCarData => {
      const { id, ...data } = car as CarData
      return data
    },
    fromFirestore: (snapshot, options): CarData => {
      const data = snapshot.data(options)
      return {
        id: snapshot.id,
        title: data.title,
      }
    },
  }

  // Fetch car data
  const {
    data: carData,
    error: carError,
    pending: isCarLoading,
  } = useDocument<CarData>(doc(db, "cars", carId).withConverter(carConverter))

  // Get the first (and should be only) matching car
  const car = computed(() => {
    return carData.value as CarData
  })

  // Fetch damage entries ordered by the 'order' field
  const damageEntries = ref<DamageEntry[] | null>(null)

  const {
    data: baseDamageEntries,
    error: damagesError,
    pending: isDamagesLoading,
  } = useCollection<DamageEntryBase>(
    query(
      collection(db, "cars", carId, "damages").withConverter(damageEntryConverter),
      orderBy("order")
    ),
    { once: true }
  )

  // Process entries when they change
  const processEntries = async (entries: DamageEntryBase[]) => {
    try {
      damageEntries.value = await Promise.all(
        entries.map(async entry => ({
          ...entry,
          ...(await getStorageUrls(carId, entry)),
        }))
      )
    } catch (err) {
      console.error("Error processing damage entries:", err)
      error.value = err as Error
    }
  }

  // Handle damages data changes
  watchEffect(() => {
    if (baseDamageEntries.value) {
      processEntries(baseDamageEntries.value)
    } else {
      damageEntries.value = null
    }
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
