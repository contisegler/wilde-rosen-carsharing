import { $firestore } from "~~/server/src/firebase_admin";
import type { LogEntry } from "~~/shared/types";

export default defineEventHandler(async (event): Promise<Partial<LogEntry>> => {
    assertMethod(event, 'PATCH');
    const carId = getRouterParam(event, 'carId');
    const logId = getRouterParam(event, 'logId');
    
    if (!carId || !logId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing carId or logId' });
    }
    
    const user = event.context.authenticatedUser;
    console.log('PATCH /log - authenticatedUser uid:', user?.uid);
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Nicht angemeldet' });
    }

    const body = await readBody(event);

    const logRef = $firestore
        .collection("cars")
        .doc(carId)
        .collection("log")
        .doc(logId);

    const logDoc = await logRef.get();
    if (!logDoc.exists) {
        throw createError({ statusCode: 404, statusMessage: 'Eintrag nicht gefunden' });
    }

    const logData = logDoc.data();
    console.log('PATCH /log - logData.userId:', logData?.userId, 'user.uid:', user.uid, 'match:', logData?.userId === user.uid);
    if (logData?.userId !== user.uid) {
        throw createError({ statusCode: 403, statusMessage: 'Nur der Ersteller kann die Fahrt bearbeiten' });
    }
    
    const updateData: any = {};
    
    // Handle end fields update
    if (body.endTime || body.endKm != null) {
        if (!body.endTime || body.endKm == null) {
            throw createError({ statusCode: 400, statusMessage: 'endTime und endKm sind erforderlich' });
        }
        
        const endTime = new Date(body.endTime);
        const endKm = Number(body.endKm);
        const startTime = logData?.startTime?.toDate?.() || new Date(0);
        const startKm = logData?.startKm ?? 0;

        if (endTime.getTime() <= startTime.getTime()) {
            throw createError({ statusCode: 400, statusMessage: 'Endzeit muss nach der Startzeit liegen' });
        }
        if (endKm <= startKm) {
            throw createError({ statusCode: 400, statusMessage: 'End-Kilometerstand muss größer als Start-Kilometerstand sein' });
        }
        
        updateData.endTime = endTime;
        updateData.endKm = endKm;
    }
    
    // Handle start fields update
    if (body.startTime || body.startKm != null) {
        const startTime = body.startTime ? new Date(body.startTime) : logData?.startTime?.toDate();
        const startKm = body.startKm != null ? Number(body.startKm) : logData?.startKm;
        
        // Validate start time is not in the future (optional, remove if not needed)
        // and before end time if end exists
        const existingEndTime = logData?.endTime?.toDate?.();
        if (existingEndTime && startTime.getTime() >= existingEndTime.getTime()) {
            throw createError({ statusCode: 400, statusMessage: 'Startzeit muss vor der Endzeit liegen' });
        }
        
        const existingEndKm = logData?.endKm;
        if (existingEndKm != null && startKm >= existingEndKm) {
            throw createError({ statusCode: 400, statusMessage: 'Start-Kilometerstand muss kleiner als End-Kilometerstand sein' });
        }
        
        if (body.startTime) updateData.startTime = startTime;
        if (body.startKm != null) updateData.startKm = startKm;
    }
    
    if (Object.keys(updateData).length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'Keine Felder zum Aktualisieren' });
    }
    
    try {
        await logRef.update(updateData);
        
        return {
            id: logId,
            carId,
            ...updateData,
        };
    } catch (error) {
        console.error('Error updating log entry:', error);
        throw createError({ statusCode: 500, statusMessage: 'Fehler beim Aktualisieren des Eintrags' });
    }
});
