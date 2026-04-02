import { $firestore } from "../../../src/firebase_admin";
import type { Damage, CarSide } from "~~/shared/types";

// Helper function to get side index for sorting
const getSideIndex = (side: CarSide): number => {
    const sideOrder: Record<CarSide, number> = {
        left: 0,
        back: 1,
        right: 2,
        front: 3,
        top: 4,
    };
    return sideOrder[side] ?? 5;
};

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
    
    const damages: Damage[] = damagesSnapshot.docs.map(doc => {
        const data = doc.data();
        const side = data.side as CarSide;
        
        return {
            id: doc.id,
            ...data,
            schematicPath: `cars/${carId}/schematics/${carId}_${side}.png`,
            sideIndex: getSideIndex(side),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || data.createdAt?.toDate() || new Date(),
        } as Damage;
    });
    
    // Sort by side index, then by x position
    damages.sort((a, b) => {
        if (a.sideIndex !== b.sideIndex) {
            return a.sideIndex - b.sideIndex;
        }
        return a.x - b.x;
    });
    
    return damages;
});
