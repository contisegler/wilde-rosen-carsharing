import { $firestore } from "../../../src/firebase_admin";

export default defineEventHandler(async (event) => {
    assertMethod(event, 'GET');
    const carId = getRouterParam(event, 'carId');
    
    if (!carId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing carId' });
    }
    
    const damagesSnapshot = await $firestore.collection("cars").doc(carId).collection("damages").get();
    
    if (damagesSnapshot.empty) {
        return [];
    }
    
    const damages = damagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    
    return damages;
});
