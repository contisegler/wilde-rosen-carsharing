import { $firestore } from "../src/firebase_admin";
import type { Car } from "~~/shared/types";

export default defineEventHandler(async (event): Promise<Car[]> => {
  assertMethod(event, 'GET');
  
  const carsSnapshot = await $firestore.collection('cars').get()
  
  const cars: Car[] = carsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Car))
  
  return cars
})
