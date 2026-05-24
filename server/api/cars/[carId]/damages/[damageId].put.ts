import { $firestore } from "../../../../src/firebase_admin";
import type { Damage } from "~~/shared/types";
// import { replaceDamageSchema } from "~/server/utils/damageSchemas";

export default defineEventHandler(async (event): Promise<Damage> => {
    assertMethod(event, 'PUT');
    const carId = getRouterParam(event, 'carId');
    const damageId = getRouterParam(event, 'damageId');
    
    const user = event.context.authenticatedUser;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Nicht angemeldet' });
    }
    
    const userRoles = event.context.userRoles;
    if (!userRoles.includes('damageReporter')) {
        throw createError({ statusCode: 403, statusMessage: 'Nicht authorisiert' });
    }
    console.log('PUT /damages - user:', user?.uid, user?.name, user?.email, 'roles:', userRoles);
    
    if (!carId || !damageId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing carId or damageId' });
    }
    
    // Get and validate request body with Zod
    const rawBody = await readBody(event);
    const parseResult = replaceDamageSchema.safeParse(rawBody);
    
    if (!parseResult.success) {
        throw createError({ 
            statusCode: 400, 
            statusMessage: 'Invalid request data',
            data: parseResult.error.issues
        });
    }
    
    const body = parseResult.data;
    
    try {
        const damageRef = $firestore
            .collection("cars")
            .doc(carId)
            .collection("damages")
            .doc(damageId);
        
        // Check if damage exists
        const damageDoc = await damageRef.get();
        const createdAt = damageDoc.exists ? damageDoc.data()?.createdAt : new Date();
        
        // Replace the entire damage document
        const damageData = {
            description: body.description,
            imagePath: body.imagePath,
            details: body.details || [],
            side: body.side,
            x: body.x,
            y: body.y,
            createdAt: createdAt,
            updatedAt: new Date(),
        };
        
        await damageRef.set(damageData);
        
        return transformDamageDoc(damageId, damageData, carId);
    } catch (error) {
        console.error('Error replacing damage:', error);
        throw createError({ 
            statusCode: 500, 
            statusMessage: 'Failed to replace damage entry' 
        });
    }
});
