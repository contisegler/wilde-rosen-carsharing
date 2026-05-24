# Wilde Rosen Carsharing

A web application for the Wilde Rosen carsharing community to manage shared vehicles, track damages, and log tours (Fahrtenbuch).

## Tech Stack

- **Framework:** [Nuxt 4](https://nuxt.com/) (Vue 3, TypeScript)
- **UI:** [Nuxt UI v4](https://ui.nuxt.com/) with [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Backend:** Nitro server routes (built into Nuxt)
- **Database:** [Cloud Firestore](https://firebase.google.com/docs/firestore) (Firebase)
- **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth) (Email/Password + Google Sign-In)
- **File Storage:** [Firebase Storage](https://firebase.google.com/docs/storage)
- **Hosting:** [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)
- **Validation:** [Zod](https://zod.dev/)
- **Image Handling:** [@nuxt/image](https://image.nuxt.com/), [nuxt-easy-lightbox](https://github.com/nickvdyck/nuxt-easy-lightbox)
- **Package Manager:** [pnpm](https://pnpm.io/)

## Project Structure

```
├── app/                    # Client-side application (Nuxt 4 app directory)
│   ├── assets/css/         # Global styles (Tailwind, custom olive theme)
│   ├── components/         # Vue components (CarDamageImage, LogViewer, etc.)
│   ├── composables/        # Composables and Pinia stores
│   ├── middleware/          # Client-side route middleware (auth guard)
│   ├── pages/              # File-based routing
│   │   ├── cars/[carId]/   # Car-specific pages (damages, log)
│   │   ├── users/[uid]/    # User settings
│   │   ├── login.vue       # Authentication page
│   │   └── index.vue       # Home page (car selector)
│   └── plugins/            # Firebase client plugin
├── server/                 # Server-side (Nitro)
│   ├── api/                # REST API routes for cars, damages, and logs
│   ├── middleware/          # Server auth middleware (token verification)
│   ├── src/                # Firebase Admin SDK initialization
│   └── utils/              # Shared server utilities and Zod schemas
├── shared/types/           # Shared TypeScript interfaces (Car, Damage, LogEntry, etc.)
├── scripts/                # Python helper scripts for admin tasks
├── firebase.json           # Firebase configuration (Firestore, emulators)
├── firestore.rules         # Firestore security rules
├── nuxt.config.ts          # Nuxt configuration
└── package.json            # Dependencies and scripts
```

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/) (install via `npm install -g pnpm`)
- A Firebase project with Firestore, Auth, and Storage enabled

### Install Dependencies

```bash
pnpm install
```

### Environment

The application reads its Firebase configuration from the `FIREBASE_WEBAPP_CONFIG` environment variable. This is a JSON string containing your Firebase web app config (apiKey, authDomain, projectId, etc.).

Firebase App Hosting automatically injects this variable in deployed environments.  
For local development, either set it manually or use Firebase emulators.

### Development Server

Start the dev server on `http://localhost:3000`:

```bash
pnpm dev
```

### Firebase Emulators

The project supports Firebase Auth and Firestore emulators for local development. Emulator ports are configured in `firebase.json`:

- Auth emulator: `localhost:9099`
- Firestore emulator: `localhost:8080`

Toggle emulators via `app.config.ts` by setting `firebase.emulators` to `true`.

### Build

Build the application for production:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

## Deployment

The project uses **Firebase App Hosting** with three branches and two Firebase/GCP projects:

```
npr  →  staging  →  main
 ↓        ↓          ↓
dev DB   prod DB    prod DB
```

| Branch    | Environment | GCP Project | Database      | Purpose                                           |
|-----------|-------------|-------------|---------------|---------------------------------------------------|
| `npr`     | NPR (dev)   | Separate    | Dev database  | Independent development environment — safe to break |
| `staging` | Staging     | Production  | Prod database | Pre-release verification with real production data |
| `main`    | Production  | Production  | Prod database | Live production deployment                        |

Changes flow from `npr` → `staging` → `main`. The `npr` branch uses its own GCP project with a separate database and storage, so there are no consequences to production. The `staging` and `main` branches share the same production database, so `staging` is used to verify changes look correct with real data before merging to `main`.

Pushing to any of these branches triggers an automatic build and deploy via a **Firebase App Hosting webhook**. Firebase App Hosting builds the Nuxt application and deploys it to its hosting infrastructure.

The `FIREBASE_WEBAPP_CONFIG` environment variable is injected automatically by Firebase App Hosting at build time — no manual `.env` file is needed in deployed environments.

## User Roles

User roles are stored in Firestore under `users/{uid}/settings/roles` as boolean fields:

| Role              | Permissions                                    |
|-------------------|------------------------------------------------|
| (none / guest)    | View all car damages (read-only)               |
| `member`          | View damages (read-only) + use the Fahrtenbuch (log tours) |
| `damageReporter`  | View damages + add/edit damage reports          |

Roles are assigned via Firestore (not through the app UI). The server middleware verifies the user's Firebase ID token and fetches roles from Firestore on each API request.

## Firestore Security Rules

- **Cars and damages:** Readable by everyone (public). Damage writes require authentication and the `damage_reporter` role.
- **Users:** Each user can read/write their own user document. Settings (including roles) are read-only for the user and managed externally.

## Available Scripts

| Command          | Description                      |
|------------------|----------------------------------|
| `pnpm dev`       | Start the development server     |
| `pnpm build`     | Build for production             |
| `pnpm preview`   | Preview the production build     |
| `pnpm generate`  | Generate a static site           |
| `pnpm postinstall`| Run `nuxt prepare` after install |

## Documentation

User-facing HOW-TO guides are available in the [`docs/`](docs/) folder and published via GitHub Pages:

- [Guide for Guests](docs/guide-guests.md) — Viewing car damages
- [Guide for Members](docs/guide-members.md) — Logging tours in the Fahrtenbuch
- [Guide for Damage Reporters](docs/guide-damage-reporters.md) — Reporting and editing damages

## License

Copyright (C) 2026 Hendrik Preuss. Licensed under [AGPL-3.0-or-later](LICENSE).
