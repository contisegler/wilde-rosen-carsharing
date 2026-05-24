import { $firestore } from "../../../../src/firebase_admin";
import type { Damage } from "~~/shared/types";
// import { updateDamageSchema } from "~/server/utils/damageSchemas";

export default defineEventHandler(async (event): Promise<Damage> => {
    assertMethod(event, 'PATCH');
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
    console.log('PATCH /damages - user:', user?.uid, user?.name, user?.email, 'roles:', userRoles);
    
    if (!carId || !damageId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing carId or damageId' });
    }
    
    // Get and validate request body with Zod
    const rawBody = await readBody(event);
    const parseResult = updateDamageSchema.safeParse(rawBody);
    
    if (!parseResult.success) {
        throw createError({ 
            statusCode: 400, 
            statusMessage: 'Invalid request data',
            data: parseResult.error.issues
        });
    }
    
    const body = parseResult.data;
    
    // Build update object with only provided fields
    const updateData: any = {
        updatedAt: new Date(),
    };
    
    if (body.description !== undefined) updateData.description = body.description;
    if (body.imagePath !== undefined) updateData.imagePath = body.imagePath;
    if (body.details !== undefined) updateData.details = body.details;
    if (body.side !== undefined) updateData.side = body.side;
    if (body.x !== undefined) updateData.x = body.x;
    if (body.y !== undefined) updateData.y = body.y;
    
    try {
        const damageRef = $firestore
            .collection("cars")
            .doc(carId)
            .collection("damages")
            .doc(damageId);
        
        // Check if damage exists
        const damageDoc = await damageRef.get();
        if (!damageDoc.exists) {
            throw createError({ 
                statusCode: 404, 
                statusMessage: 'Damage not found' 
            });
        }
        
        // Update the damage
        await damageRef.update(updateData);
        
        // Return updated damage
        const updatedDoc = await damageRef.get();
        const data = updatedDoc.data();
        if (!data) {
            throw createError({ statusCode: 500, statusMessage: 'Failed to retrieve updated damage' });
        }
        
        return transformDamageDoc(updatedDoc.id, data, carId);
    } catch (error: any) {
        if (error.statusCode) {
            throw error;
        }
        console.error('Error updating damage:', error);
        throw createError({ 
            statusCode: 500, 
            statusMessage: 'Failed to update damage entry' 
        });
    }
});
