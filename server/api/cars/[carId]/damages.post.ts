import { $firestore } from "../../../src/firebase_admin";
import type { Damage } from "~~/shared/types";
// import { createDamageSchema } from "~/server/utils/damageSchemas";

export default defineEventHandler(async (event): Promise<Damage> => {
    assertMethod(event, 'POST');
    const carId = getRouterParam(event, 'carId');
    
    if (!carId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing carId' });
    }
    
    // Get and validate request body with Zod
    const rawBody = await readBody(event);
    const parseResult = createDamageSchema.safeParse(rawBody);
    
    if (!parseResult.success) {
        throw createError({ 
            statusCode: 400, 
            statusMessage: 'Invalid request data',
            data: parseResult.error.issues
        });
    }
    
    const body = parseResult.data;
    
    // Create the damage entry
    const damageData = {
        description: body.description,
        imagePath: body.imagePath,
        details: body.details || [],
        side: body.side,
        x: body.x,
        y: body.y,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    
    try {
        const damageRef = await $firestore
            .collection("cars")
            .doc(carId)
            .collection("damages")
            .add(damageData);
        
        const createdData = await damageRef.get()
        return transformDamageDoc(damageRef.id, createdData.data(), carId);
    } catch (error) {
        console.error('Error creating damage:', error);
        throw createError({ 
            statusCode: 500, 
            statusMessage: 'Failed to create damage entry' 
        });
    }
});
