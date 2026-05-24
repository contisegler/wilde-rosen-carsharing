import { $firestore } from "../../src/firebase_admin";
import type { Car } from "~~/shared/types";

export default defineEventHandler(async (event): Promise<Car> => {
  assertMethod(event, 'GET');
  const carId = getRouterParam(event, 'carId')
  
  if (!carId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing carId'
    })
  }
  
  const carDoc = await $firestore.collection('cars').doc(carId).get()
  
  if (!carDoc.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Car not found'
    })
  }
  
  return {
    id: carDoc.id,
    ...carDoc.data()
  } as Car
})
