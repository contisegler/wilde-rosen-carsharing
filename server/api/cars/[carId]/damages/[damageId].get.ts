import { $firestore } from "../../../../src/firebase_admin";
import type { Damage } from "~~/shared/types";

export default defineEventHandler(async (event): Promise<Damage> => {
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
    
    const data = damageDoc.data();
    if (!data) {
        throw createError({ statusCode: 404, statusMessage: 'Damage data not found' });
    }
    
    return transformDamageDoc(damageDoc.id, data, carId);
});
