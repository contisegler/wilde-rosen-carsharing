# Firebase Admin SDK Setup (Keyless Authentication)

This project uses Firebase Admin SDK with **keyless authentication** via Application Default Credentials (ADC). No service account keys are required.

## Quick Start

### Local Development
```bash
# 1. Set your project
gcloud config set project <PROJECT_ID>

# 2. Authenticate with ADC
gcloud auth application-default login

# 3. Set quota project
gcloud auth application-default set-quota-project <PROJECT_ID>

# 4. Start dev server
pnpm dev
```

### Production (Firebase App Hosting)
```bash
# Grant App Hosting service account permission to sign tokens for itself (one-time per project)
gcloud iam service-accounts add-iam-policy-binding \
  firebase-app-hosting-compute@<PROJECT_ID>.iam.gserviceaccount.com \
  --member="serviceAccount:firebase-app-hosting-compute@<PROJECT_ID>.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --project=<PROJECT_ID>
```

---

## How It Works

The project uses a patched version of `nuxt-vuefire` that detects credentials in three ways:

1. **`GOOGLE_APPLICATION_CREDENTIALS`** - Explicit service account key (traditional method)
2. **`FIREBASE_CONFIG`** - Auto-injected by Firebase App Hosting (production)
3. **SSR + Development Mode** - Uses ADC for local development

## Local Development Setup

### Keyless Setup with ADC (Recommended)

1. Install Google Cloud SDK if not already installed:
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # Linux
   curl https://sdk.cloud.google.com | bash
   ```

2. Set the active project:
   ```bash
   gcloud config set project <PROJECT_ID>
   ```

3. Authenticate with Application Default Credentials:
   ```bash
   gcloud auth application-default login
   ```

4. Set the quota project for ADC:
   ```bash
   gcloud auth application-default set-quota-project <PROJECT_ID>
   ```

5. **Do NOT set `GOOGLE_APPLICATION_CREDENTIALS` in `.env`** - leave it unset to use ADC automatically

6. Start the development server:
   ```bash
   pnpm dev
   ```

**Note:** Session cookies are disabled in development mode because custom token signing requires access to Google's metadata server, which is only available in Google Cloud environments. Auth still works fully for client-side operations. No IAM permissions are needed for local development since session cookies are disabled.

### Alternative: Service Account Key (Not Recommended)

Only use this if you cannot use ADC:

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

The App Hosting service account needs the `iam.serviceAccounts.signBlob` permission to sign custom tokens.

**How it works:**
- The Firebase Admin SDK auto-discovers the `firebase-app-hosting-compute@<PROJECT_ID>.iam.gserviceaccount.com` service account from the metadata server
- This service account needs permission to sign tokens for itself
- Grant the `Service Account Token Creator` role at the **service account level** (least privilege)

**Grant the permission:**

```bash
gcloud iam service-accounts add-iam-policy-binding \
  firebase-app-hosting-compute@<PROJECT_ID>.iam.gserviceaccount.com \
  --member="serviceAccount:firebase-app-hosting-compute@<PROJECT_ID>.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --project=<PROJECT_ID>
```

**What this does:**
- Grants the App Hosting service account permission to sign tokens **for itself only**
- This includes the `iam.serviceAccounts.signBlob` permission needed for custom token signing
- The Admin SDK can now auto-discover and use this service account to sign tokens
- Follows the principle of least privilege (service account can only sign for itself, not for other service accounts)

**Why service account-level?**
According to the [Firebase Admin SDK documentation](https://firebase.google.com/docs/auth/admin/create-custom-tokens), when using `applicationDefault()` credentials, the SDK auto-discovers a service account from the metadata server. That service account needs the `signBlob` permission. By granting the permission at the service account level (rather than project-wide), we ensure the service account can only sign for itself, improving security.

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
2. Update nuxt-vuefire: `pnpm update nuxt-vuefire`
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
