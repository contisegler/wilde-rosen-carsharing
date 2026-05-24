import { $firestore } from "~~/server/src/firebase_admin";
import type { LogEntry } from "~~/shared/types";

export default defineEventHandler(async (event): Promise<Partial<LogEntry>> => {
    assertMethod(event, 'POST');
    const carId = getRouterParam(event, 'carId');
    
    if (!carId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing carId' });
    }
    
    const user = event.context.authenticatedUser;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Nicht angemeldet' });
    }
    
    const userRoles = event.context.userRoles;
    if (!userRoles.includes('member')) {
        throw createError({ statusCode: 403, statusMessage: 'Nicht authorisiert' });
    }
    console.log('POST /log - user:', user?.uid, user?.name, user?.email, 'roles:', userRoles);

    const body = await readBody(event);

    if (!body.startTime || body.startKm == null) {
        throw createError({ statusCode: 400, statusMessage: 'startTime und startKm sind erforderlich' });
    }

    // Validate notes if provided
    if (body.notes !== undefined) {
        if (typeof body.notes !== 'string') {
            throw createError({ statusCode: 400, statusMessage: 'Notizen müssen ein Text sein' });
        }
        if (body.notes.length > 500) {
            throw createError({ statusCode: 400, statusMessage: 'Notizen dürfen maximal 500 Zeichen lang sein' });
        }
    }

    const logData: any = {
        userId: user.uid,
        userName: user.name || user.email || 'Unbekannt',
        startTime: new Date(body.startTime),
        startKm: Number(body.startKm),
    };
    
    // Add notes if provided (store as 'note' singular to match existing field name)
    if (body.notes) {
        logData.note = body.notes;
    }
    
    console.log('POST /log - saving logData:', logData);
    
    try {
        const logRef = await $firestore
            .collection("cars")
            .doc(carId)
            .collection("log")
            .add(logData);
        
        return {
            id: logRef.id,
            carId,
            userId: logData.userId,
            userName: logData.userName,
            startTime: logData.startTime,
            startKm: logData.startKm,
        };
    } catch (error) {
        console.error('Error creating log entry:', error);
        throw createError({ statusCode: 500, statusMessage: 'Fehler beim Erstellen des Eintrags' });
    }
});
