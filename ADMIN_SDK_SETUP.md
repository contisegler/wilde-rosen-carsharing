# Firebase Admin SDK Setup (Keyless Authentication)

This project uses Firebase Admin SDK with **keyless authentication** via Application Default Credentials (ADC). No service account keys are required.

## How It Works

The project uses a patched version of `nuxt-vuefire` that detects credentials in three ways:

1. **`GOOGLE_APPLICATION_CREDENTIALS`** - Explicit service account key (traditional method)
2. **`FIREBASE_CONFIG`** - Auto-injected by Firebase App Hosting (production)
3. **SSR + Development Mode** - Uses ADC for local development

## Local Development Setup

### Option 1: Application Default Credentials (Recommended)

1. Install Google Cloud SDK if not already installed:
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # Linux
   curl https://sdk.cloud.google.com | bash
   ```

2. Authenticate with your Google account:
   ```bash
   gcloud auth application-default login
   ```

3. Set the ADC path in your `.env` file:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/gcloud/application_default_credentials.json"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Option 2: Service Account Key (Not Recommended)

1. Download service account JSON from [Firebase Console](https://console.firebase.google.com/)
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"

2. Save the file as `service-account.json` in project root (gitignored)

3. Set the path in your `.env` file:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS="service-account.json"
   ```

## Firebase App Hosting Setup

### Automatic Authentication

Firebase App Hosting automatically provides credentials via the `FIREBASE_CONFIG` environment variable. No manual setup required.

### Required IAM Permissions

The App Hosting service account needs the **Service Account Token Creator** role to mint session cookies.

**Service Account Name Format:**
```
firebase-app-hosting-compute@<PROJECT_ID>.iam.gserviceaccount.com
```

**Grant Permission:**

1. Go to [Google Cloud Console IAM](https://console.cloud.google.com/iam-admin/iam)

2. Find the service account:
   ```
   firebase-app-hosting-compute@<PROJECT_ID>.iam.gserviceaccount.com
   ```

3. Click "Edit" (pencil icon)

4. Click "Add Another Role"

5. Select: **Service Account Token Creator**

6. Click "Save"

**Or via gcloud CLI:**
```bash
gcloud projects add-iam-policy-binding <PROJECT_ID> \
  --member="serviceAccount:firebase-app-hosting-compute@<PROJECT_ID>.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountTokenCreator"
```

### Multi-Environment Setup

For **npr**, **staging**, and **prd** environments:

1. Each environment deploys to its own Firebase project
2. Each project's App Hosting service account needs the Token Creator role
3. Credentials are auto-injected per environment (no cross-project access)

## Patch Details

The project uses `patch-package` to modify `nuxt-vuefire` to support keyless authentication.

**Patch Location:** `patches/nuxt-vuefire+1.1.0.patch`

**What it does:**
- Detects `FIREBASE_CONFIG` env var (App Hosting)
- Allows SSR in development mode to use ADC
- Maintains backward compatibility with explicit credentials

**When VueFire PR #1651 merges:**
1. Remove the patch: `rm patches/nuxt-vuefire+1.1.0.patch`
2. Update nuxt-vuefire: `npm update nuxt-vuefire`
3. Add to `nuxt.config.ts`:
   ```typescript
   vuefire: {
     useRole: true,  // Official keyless auth option
     auth: {
       enabled: true,
       sessionCookie: true,
     },
     config: JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG || ""),
   }
   ```

## Troubleshooting

### Local Development Issues

**Error: "The default Firebase app does not exist"**
- Ensure you've run `gcloud auth application-default login`
- Check that `GOOGLE_APPLICATION_CREDENTIALS` points to valid credentials
- Verify SSR is enabled in `nuxt.config.ts`

**Error: "Permission denied"**
- Your Google account needs appropriate Firebase permissions
- Use a service account key as fallback (Option 2)

### App Hosting Issues

**Error: "Failed to mint session cookie"**
- Grant Service Account Token Creator role (see above)
- Wait a few minutes for IAM changes to propagate

**Error: "FIREBASE_CONFIG not found"**
- This should never happen on App Hosting
- Check that you're deploying to Firebase App Hosting (not Cloud Run or other platforms)

## Security Notes

✅ **Safe Practices:**
- Using ADC locally (credentials stored in gcloud config)
- Using App Hosting's automatic credentials (no keys in code)
- Service account keys in `.gitignore`

❌ **Avoid:**
- Committing service account keys to git
- Hardcoding credentials in code
- Sharing service account keys via insecure channels

## References

- [VueFire Issue #1636](https://github.com/vuejs/vuefire/issues/1636)
- [VueFire PR #1651](https://github.com/vuejs/vuefire/pull/1651) (Official keyless auth support)
- [Firebase App Hosting - Admin SDK](https://firebase.google.com/docs/app-hosting/firebase-sdks)
- [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials)
