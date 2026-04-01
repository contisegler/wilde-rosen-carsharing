# Google Calendar API Integration

## Overview

This API endpoint fetches events from the Google Calendar using service account authentication.

**Calendar ID:** `eaec8e2b705d0cab95707f20a55df8e6883a6aa99e7c24928e91130e7a308fcd@group.calendar.google.com`

## Endpoint

- **URL:** `/api/calendar/events`
- **Method:** GET
- **Authentication:** Service Account (automatic in Cloud Run)

## Response Format

### Success Response
```json
{
  "success": true,
  "count": 10,
  "events": [
    {
      "id": "event-id",
      "summary": "Event Title",
      "description": "Event Description",
      "start": "2026-04-01T10:00:00Z",
      "end": "2026-04-01T11:00:00Z",
      "location": "Event Location",
      "status": "confirmed"
    }
  ]
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": []
}
```

## Authentication

The API uses Google's Application Default Credentials (ADC) which automatically works in Cloud Run:

1. **In Cloud Run:** The service account attached to the Cloud Run service is automatically used
2. **Local Development:** You'll get authentication errors unless you set up local credentials

### Local Development Setup (Optional)

If you want to test locally, you need to authenticate:

```bash
# Option 1: Use gcloud CLI
gcloud auth application-default login

# Option 2: Use a service account key file (not recommended for production)
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

## Implementation Details

- Uses `google-auth-library` for authentication (no key file needed in Cloud Run)
- Fetches upcoming events (from current time forward)
- Returns up to 100 events, ordered by start time
- Only includes single events (recurring events are expanded)
- Requires `calendar.readonly` scope

## Permissions

The Cloud Run service account must have **Calendar Reader** permission on the calendar.
