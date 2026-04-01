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
2. **Local Development Setup**

**Important:** Standard `gcloud auth application-default login` does NOT grant Calendar API access. You need to use a custom OAuth client with Calendar scopes.

**Option 1: Use custom OAuth client (recommended for local dev)**

1. Get the OAuth 2.0 Client ID:
   - **For team members:** Download from [Secret Manager](https://console.cloud.google.com/security/secret-manager/secret/OAuth2Client_LocalDevelopment-CalendarAPI_CLIENT_SECRET/versions?project=wilde-rosen-npr-dfafc)
   - Save it to `.oauth-client-secret.json` (already in `.gitignore`)
   - **To create a new one:** Go to APIs & Credentials → Create Credentials → OAuth client ID (Application type: Desktop app)

2. Authenticate with Calendar scope:
   ```bash
   gcloud auth application-default login \
     --client-id-file=.oauth-client-secret.json \
     --scopes=https://www.googleapis.com/auth/calendar.readonly,https://www.googleapis.com/auth/cloud-platform
   ```

3. Restart your dev server

**Option 2: Test on deployed environment**
- The API already works in Cloud Run with the service account
- Use the deployed NPR environment for API testing
- Use local dev for UI/frontend changes only

**Note:** Never commit OAuth client secrets to git.

## Implementation Details

- Uses `google-auth-library` for authentication (no key file needed in Cloud Run)
- Fetches upcoming events (from current time forward)
- Returns up to 100 events, ordered by start time
- Only includes single events (recurring events are expanded)
- Requires `calendar.readonly` scope

## Permissions

The Cloud Run service account must have **Calendar Reader** permission on the calendar.
