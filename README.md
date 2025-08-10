# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Firebase Admin Scripts

This directory contains helper scripts for Firebase Admin operations.

### Setup

1. Install dependencies:

   ```bash
   # Install project dependencies
   npm install -D typescript ts-node @types/node

   # Install Firebase and Commander
   npm install firebase-admin commander
   ```

2. Set up authentication:
   - Install Google Cloud SDK if you haven't already:

     ```bash
     # On Linux
     sudo apt-get install google-cloud-sdk

     # On macOS
     brew install --cask google-cloud-sdk
     ```

   - Log in using your Google account:
     ```bash
     gcloud auth application-default login
     ```
   - Set your project:
     ```bash
     gcloud config set project <your-project-id>
     ```

### Copy Car

```bash
npm run copy-car -s <source-car-id> -d <destination-car-id>
```
