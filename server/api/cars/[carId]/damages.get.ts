import { $firestore } from "../../../src/firebase_admin";
import type { Damage, CarSide } from "~~/shared/types";

export default defineEventHandler(async (event): Promise<Damage[]> => {
    assertMethod(event, 'GET');
    const carId = getRouterParam(event, 'carId');
    
    if (!carId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing carId' });
    }
    
    const damagesSnapshot = await $firestore.collection("cars").doc(carId).collection("damages").get();
    
    if (damagesSnapshot.empty) {
        return [];
    }
    
    const damages: Damage[] = damagesSnapshot.docs.map(doc => 
        transformDamageDoc(doc.id, doc.data(), carId)
    );
    
    // Sort by side index, then by x position
    damages
      .filter((damage) => !damage.isArchive)
      .sort((a, b) => {
        if (a.sideIndex !== b.sideIndex) {
            return a.sideIndex - b.sideIndex;
        }
        return a.x - b.x;
    });
    
    return damages;
});
