import { calendar } from '@googleapis/calendar';
import { GoogleAuth } from 'google-auth-library';

const CALENDAR_ID = 'eaec8e2b705d0cab95707f20a55df8e6883a6aa99e7c24928e91130e7a308fcd@group.calendar.google.com';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { timeMin, timeMax } = body;

    if (!timeMin || !timeMax) {
      return {
        success: false,
        error: 'timeMin and timeMax are required parameters',
      };
    }

    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendarClient = calendar({ version: 'v3', auth });

    const response = await calendarClient.events.list({
      calendarId: CALENDAR_ID,
      timeMin: timeMin,
      timeMax: timeMax,
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    return {
      success: true,
      count: events.length,
      events: events.map((event) => ({
        id: event.id,
        summary: event.summary,
        description: event.description,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        creator: event.creator?.email
      })),
    };
  } catch (error: any) {
    console.error('Error fetching calendar events:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to fetch calendar events',
      details: error.errors || [],
    };
  }
});
