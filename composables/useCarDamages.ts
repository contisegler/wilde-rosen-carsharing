import { collection, query, orderBy, where } from 'firebase/firestore'
import type { DocumentData, WithFieldValue, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'

interface CarData {
  id: string
  carId: string
  title: string
}

interface UseCarDamagesOptions {
  carId: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
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
export function useCarDamages (options: UseCarDamagesOptions): UseCarDamagesReturn {
  console.log('useCarDamages called with options:', options)
  const db = useFirestore()
  const error = ref<Error | null>(null)
  const isLoading = ref(true)
  
  // Create a Firestore data converter with proper type safety
  const damageEntryConverter = {
    toFirestore(damageEntry: WithFieldValue<DamageEntry>): DocumentData {
      const { id, ...data } = damageEntry as DamageEntry
      return data as DocumentData
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot<DocumentData>,
      options?: SnapshotOptions
    ): DamageEntry {
      const data = snapshot.data(options) as Omit<DamageEntry, 'id'> & {
        createdAt: { toDate: () => Date }
        updatedAt: { toDate: () => Date }
      }
      
      // Create the result with proper typing and required fields
      return {
        id: snapshot.id,
        path: data.path,
        description: data.description,
        x: data.x,
        y: data.y,
        side: data.side,
        details: data.details || [],
        order: data.order,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      }
    }
  }

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
        title: data.title
      } as CarData
    }
  }

  // Create a query to find the car document by its carId field
  const carsQuery = query(
    collection(db, 'cars').withConverter(carConverter),
    where('carId', '==', options.carId)
  )
  
  // Use useCollection to get the car document
  const { data: cars, error: carError } = useCollection(
    carsQuery,
    { once: true }
  )
  
  // Get the first (and should be only) matching car
  const car = computed(() => {
    console.log('cars.value:', cars.value)
    const doc = cars.value?.[0]
    if (!doc) return null
    return doc as CarData
  })

  // Create a subcollection query for damage entries
  // We'll use the car's document ID (from the query result) to build the subcollection path
  const damageEntriesQuery = computed(() => {
    if (!car.value) {
      console.log('No car document yet, not creating damage entries query')
      return null
    }
    
    console.log('Creating damage entries query for car document ID:', car.value.id)
    return query(
      collection(db, 'cars', car.value.id, 'damages').withConverter(damageEntryConverter),
      orderBy(
        options.sortBy || 'order', 
        options.sortDirection || 'asc'
      )
    )
  })
  
  // Use VueFire's useCollection with one-time fetch
  const { 
    data: damageEntries, 
    error: damageEntriesError,
    pending: damageEntriesPending
  } = useCollection<DamageEntry>(
    damageEntriesQuery,
    { 
      once: true,
      // Only run the query when we have a valid car document
      wait: !car.value
    }
  )

  // Watch for changes and update state
  watchEffect(() => {
    const wasLoading = isLoading.value
    
    // Update loading state
    isLoading.value = damageEntriesPending.value || !car.value
    
    // Update error state
    error.value = damageEntriesError.value || carError.value || null
    
    console.log('WatchEffect - isLoading:', isLoading.value, 'damageEntriesPending:', damageEntriesPending.value, 'hasCarDoc:', !!car.value)
    
    if (error.value) {
      console.error('Error loading data:', error.value)
    }
    
    if (wasLoading && !isLoading.value) {
      console.log('Loading complete. Car:', !!car.value, 'Damage entries:', damageEntries.value?.length || 0)
    }
  })
  
  return {
    car: car,
    damageEntries: damageEntries || ref(null),
    isLoading,
    error
  }
}
