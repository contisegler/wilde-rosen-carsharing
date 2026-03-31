# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Firebase Admin Scripts

This directory contains helper scripts for Firebase Admin operations.

### Setup

1. Install dependencies:

   ```bash
   # Install project dependencies
   pnpm add -D typescript ts-node @types/node

   # Install Firebase and Commander
   pnpm add firebase-admin commander
   ```

2. Set up authentication:
   - Install Google Cloud SDK if you haven't already:

     [install-sdk](https://docs.cloud.google.com/sdk/docs/install-sdk)

   - Log in using your Google account:
     ```bash
     gcloud auth application-default login
     ```
   - Set your project:
     ```bash
     gcloud config set project wilde-rosen-npr-dfafc<your-project-id>
     ```

### Copy Car

```bash
pnpm copy-car -s <source-car-id> -d <destination-car-id>
```
