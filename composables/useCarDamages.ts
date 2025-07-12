// Firebase imports
import { collection, query, where, orderBy } from "firebase/firestore"
import { getStorage, ref as storageRef, getDownloadURL } from "firebase/storage"
import type { FirestoreDataConverter, QueryDocumentSnapshot, WithFieldValue, DocumentData, SnapshotOptions, Timestamp } from "firebase/firestore"

interface UseCarDamagesOptions {
  carId: string
  sortBy?: string
  sortDirection?: "asc" | "desc"
}

type FirestoreDamageEntry = Omit<DamageEntry, "id" | "createdAt" | "updatedAt" | "imageUrl" | "schematicUrl"> & {
  createdAt: Timestamp
  updatedAt: Timestamp
}

interface UseCarDamagesReturn {
  car: Ref<CarData | null>
  damageEntries: Ref<DamageEntry[] | null>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

/**
 * Composable to fetch and manage car data and its damage entries
 */
export function useCarDamages(options: UseCarDamagesOptions): UseCarDamagesReturn {
  console.log("useCarDamages called with options:", options)
  const db = useFirestore()
  const error = ref<Error | null>(null)
  const isLoading = ref(true)

  // Helper function to generate storage URLs
  async function getStorageUrls(
    carId: string,
    entry: DamageEntryBase
  ): Promise<{ imageUrl: string; schematicUrl: string }> {
    const storage = getStorage()
    try {
      const [imageUrl, schematicUrl] = await Promise.all([
        getDownloadURL(storageRef(storage, entry.path)),
        getDownloadURL(storageRef(storage, `${carId}_${entry.side}.png`)),
      ])
      return { imageUrl, schematicUrl }
    } catch (err) {
      console.error("Error generating storage URLs:", err)
      return { imageUrl: "", schematicUrl: "" }
    }
  }

  // Create a Firestore data converter with proper type safety
  const createDamageEntryConverter = (): FirestoreDataConverter<
    DamageEntryBase,
    FirestoreDamageEntry
  > => ({
    toFirestore: (damageEntry: WithFieldValue<DamageEntryBase>): FirestoreDamageEntry => {
      const { id, createdAt, updatedAt, ...data } = damageEntry as DamageEntryBase
      return {
        ...data,
        createdAt: createdAt as unknown as Timestamp,
        updatedAt: updatedAt as unknown as Timestamp,
      }
    },
    fromFirestore: (
      snapshot: QueryDocumentSnapshot<FirestoreDamageEntry>,
      options: SnapshotOptions
    ): DamageEntryBase => {
      const data = snapshot.data(options)

      return {
        id: snapshot.id,
        path: data.path,
        description: data.description || "",
        x: data.x || 0,
        y: data.y || 0,
        side: data.side || "front",
        details:
          data.details?.map(detail => ({
            id: detail.id,
            description: detail.description,
            path: detail.path,
          })) || [],
        order: data.order || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    },
  })

  // Create a converter for CarData
  const carConverter = {
    toFirestore(car: WithFieldValue<CarData>): DocumentData {
      const { id, ...data } = car as CarData
      return data as DocumentData
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot<DocumentData>,
      options: SnapshotOptions
    ): CarData {
      const data = snapshot.data(options)
      return {
        id: snapshot.id,
        carId: data.carId,
        title: data.title,
      } as CarData
    },
  }

  // Create a query to find the car document by its carId field
  const carsQuery = query(
    collection(db, "cars").withConverter(carConverter),
    where("carId", "==", options.carId)
  )

  // Use useCollection to get the car document
  const { data: cars, error: carError } = useCollection(carsQuery, { once: true })

  // Get the first (and should be only) matching car
  const car = computed(() => {
    console.log("cars.value:", cars.value)
    const doc = cars.value?.[0]
    if (!doc) return null
    return doc as CarData
  })

  // Create a subcollection query for damage entries
  // We'll use the car's document ID (from the query result) to build the subcollection path
  const damageEntriesQuery = computed(() => {
    // Return null if car is not loaded yet (handles SSR case)
    if (!car.value?.id) return null

    console.log("Creating damage entries query for car document ID:", car.value.id)
    try {
      return query(
        collection(db, "cars", car.value.id, "damages").withConverter(createDamageEntryConverter()),
        orderBy(options.sortBy || "order", options.sortDirection || ("asc" as const))
      )
    } catch (err) {
      console.error("Error creating damage entries query:", err)
      return null
    }
  })

  // Use VueFire's useCollection to fetch the damage entries
  const { data: baseDamageEntries } = useCollection<DamageEntryBase>(damageEntriesQuery, {
    once: true,
    // Only wait for car if we're on the server
    wait: !car.value,
  })

  // Process damage entries to add storage URLs
  const damageEntries = ref<DamageEntry[] | null>(null)
  
  // Process entries on both server and client
  const processEntries = async (entries: DamageEntryBase[]) => {
    try {
      const entriesWithUrls = await Promise.all(
        entries.map(async (entry: DamageEntryBase) => {
          const urls = await getStorageUrls(options.carId, entry)
          return {
            ...entry,
            imageUrl: urls.imageUrl,
            schematicUrl: urls.schematicUrl,
          } as DamageEntry
        })
      )
      damageEntries.value = entriesWithUrls
    } catch (err) {
      console.error("Error processing damage entries:", err)
      error.value = err as Error
    } finally {
      isLoading.value = false
    }
  }
  
  // Process entries when baseDamageEntries changes
  watchEffect(() => {
    if (baseDamageEntries.value) {
      processEntries(baseDamageEntries.value)
    } else {
      damageEntries.value = null
      isLoading.value = false
    }
  })
  
  // Initial processing on server
  onMounted(() => {
    if (baseDamageEntries.value && import.meta.client) {
      processEntries(baseDamageEntries.value)
    }
  })

  // Handle car loading and errors
  watchEffect(() => {
    if (carError.value) {
      error.value = carError.value
      isLoading.value = false
    }
  })

  return {
    car,
    damageEntries: computed(() => damageEntries.value),
    isLoading,
    error,
  }
}
