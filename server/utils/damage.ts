import type { CarSide, Damage } from "~~/shared/types";

// Helper function to get side index for sorting
export const getSideIndex = (side: CarSide): number => {
    const sideOrder: Record<CarSide, number> = {
        left: 0,
        back: 1,
        right: 2,
        front: 3,
        top: 4,
    };
    return sideOrder[side] ?? 5;
};

// Transform Firestore damage document to Damage type with all required fields
export const transformDamageDoc = (docId: string, data: any, carId: string): Damage => {
    const side = data.side as CarSide;
    
    return {
        id: docId,
        ...data,
        schematicPath: `cars/${carId}/schematics/${carId}_${side}.png`,
        sideIndex: getSideIndex(side),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || data.createdAt?.toDate() || new Date(),
    } as Damage;
};
