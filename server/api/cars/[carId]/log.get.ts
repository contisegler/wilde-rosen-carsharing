import { $firestore } from "../../../src/firebase_admin";
import type { LogEntry } from "~~/shared/types";

export default defineEventHandler(async (event): Promise<LogEntry[]> => {
    assertMethod(event, 'GET');
    const carId = getRouterParam(event, 'carId');
    
    if (!carId) {
        throw createError({ statusCode: 400, statusMessage: 'Missing carId' });
    }
    
    const logsSnapshot = await $firestore.collection("cars").doc(carId).collection("logs").get();
    
    if (logsSnapshot.empty) {
        return [];
    }
    
    const logs: LogEntry[] = logsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            carId: carId,
            ...data,
            startTime: data.startTime?.toDate() || new Date(),
            endTime: data.endTime?.toDate() || new Date(),
        } as LogEntry;
    });
    
    return logs;
});
