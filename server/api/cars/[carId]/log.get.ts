import { $firestore } from "~~/server/src/firebase_admin";
import type { LogEntry } from "~~/shared/types";

export default defineEventHandler(async (event): Promise<Partial<LogEntry>[]> => {
    assertMethod(event, 'GET');
    const carId = getRouterParam(event, 'carId');
    
    if (!carId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing carId' });
    }
    
    // Access user directly from context (populated by middleware)
    const user = event.context.authenticatedUser;
    const userRoles = event.context.userRoles;
    const isMember = user && userRoles?.includes('member') ? true : false;
    
    const logsSnapshot = await $firestore.collection("cars").doc(carId).collection("log").get();
    
    if (logsSnapshot.empty) {
        return [];
    }
    
    const logs: Partial<LogEntry>[] = logsSnapshot.docs.map(doc => {
        const data = doc.data();
        const logEntry: Partial<LogEntry> = {
            id: doc.id,
            carId: carId,
        };
        if (data.startTime) logEntry.startTime = data.startTime?.toDate() || new Date();
        if (data.endTime) logEntry.endTime = data.endTime?.toDate() || new Date();
        if (data.startKm) logEntry.startKm = data.startKm;
        if (data.endKm) logEntry.endKm = data.endKm;
        // Only include sensitive data if user is a member
        if (isMember) {
            if (data.note) logEntry.notes = data.note;
            if (data.userId) logEntry.userId = data.userId;
            if (data.userName) logEntry.userName = data.userName;
        }
        
        return logEntry;
    });
    
    return logs;
});
