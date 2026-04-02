import { $firestore } from "../../../../src/firebase_admin";

export default defineEventHandler(async (event) => {
    assertMethod(event, 'GET');
    const carId = getRouterParam(event, 'carId');
    const damageId = getRouterParam(event, 'damageId');
    
    if (!carId || !damageId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing carId or damageId' });
    }
    
    const damageDoc = await $firestore.collection("cars").doc(carId).collection("damages").doc(damageId).get();
    if (!damageDoc.exists) {
        throw createError({ statusCode: 404, statusMessage: 'Damage not found' });
    }
    const damageData = damageDoc.data();
    return damageData;
});
