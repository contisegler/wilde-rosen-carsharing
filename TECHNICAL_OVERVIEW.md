# Wilde Rosen Carsharing — Technical Overview

> Reference document for AI assistants and developers working on this project.

---

## 1. What This App Does

A **German-language** carsharing damage-tracking web app for the "Wilde Rosen" community. Users can:

- **View damages** for three shared cars (Kangoo, Kona, Zoe) with photos, schematic overlays, and lightbox galleries.
- **Report new damages** (authenticated users only) by uploading a photo, selecting a car side, positioning a marker on a schematic, and adding a description.
- **Authenticate** via Google or email/password (Firebase Auth).
- **Manage their profile** (change display name, log out).

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Nuxt 3 (`^3.17.5`) — **SPA mode** (`ssr: false`) |
| **Language** | TypeScript (strict mode, type-checked) |
| **UI Components** | [shadcn-vue](https://shadcn-vue.com/) (New York style, neutral base color) via `shadcn-nuxt` module |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite` plugin), CSS variables for theming, `tw-animate-css` |
| **Icons** | Lucide via `nuxt-lucide-icons` (auto-imported as `<LucideXxx />`) |
| **Backend / DB** | Firebase (Firestore, Storage, Auth) via `nuxt-vuefire` module |
| **Image Optimization** | `@nuxt/image` with Firebase Storage domain alias |
| **Lightbox** | `nuxt-easy-lightbox` (VueEasyLightbox) |
| **Utilities** | `@vueuse/core`, `uuid`, `clsx` + `tailwind-merge` (via `lib/utils.ts` → `cn()`) |
| **Linting** | ESLint (`@nuxt/eslint`) + Prettier |
| **Deployment target** | Firebase App Hosting (see `apphosting.yaml`) |

---

## 3. Critical Nuxt Conventions

These are essential to follow when making changes:

- **Auto-imports are ON.** Vue functions (`ref`, `computed`, `watch`, etc.), Nuxt composables (`useRoute`, `navigateTo`, `definePageMeta`, etc.), VueFire composables (`useFirestore`, `useCurrentUser`, `useFirebaseAuth`, `useFirebaseStorage`, `useDocument`, `useCollection`, `useStorageFileUrl`, `getCurrentUser`), and all components in `components/` are auto-imported. **Do NOT add explicit imports for these.**
- **Only type imports need explicit import statements** (e.g., `import type { FirestoreDataConverter } from "firebase/firestore"`).
- **Firebase SDK functions** (`signInWithPopup`, `addDoc`, `collection`, `doc`, `ref as storageRef`, `uploadBytes`, etc.) still need explicit imports from their respective Firebase packages.
- **SSR is disabled** (`ssr: false`). The app runs entirely client-side. No `server/` directory exists.
- **TypeScript strict mode** is enabled with type checking.

---

## 4. Project Structure

```
wilde-rosen-carsharing/
├── app.vue                     # Root: wraps <NuxtLayout> + <NuxtPage>
├── nuxt.config.ts              # Nuxt configuration (modules, vuefire, image alias, etc.)
├── package.json                # Dependencies & scripts
├── components.json             # shadcn-vue config (style, aliases, icon library)
├── tsconfig.json               # Extends .nuxt/tsconfig.json
├── apphosting.yaml             # Firebase App Hosting config
├── eslint.config.mjs           # ESLint flat config
├── .prettierrc                 # Prettier config (no semi, double quotes, trailing comma es5)
├── .env / .env.example         # FIREBASE_WEBAPP_CONFIG (JSON), GOOGLE_APPLICATION_CREDENTIALS
│
├── layouts/
│   └── default.vue             # App shell: logo, title, profile/login button, <slot>
│
├── middleware/
│   └── auth.ts                 # Route guard: redirects unauthenticated users to /login
│
├── pages/                      # File-based routing
│   ├── index.vue               # Home: links to car pages + "Schaden melden" (if logged in)
│   ├── kangoo.vue              # Car page: <CarViewer carId="kangoo">
│   ├── kona.vue                # Car page: <CarViewer carId="kona">
│   ├── zoe.vue                 # Car page: <CarViewer carId="zoe">
│   ├── report-damage.vue       # Damage report form (auth-protected via middleware)
│   ├── login.vue               # Google + email/password sign-in
│   ├── register.vue            # Google + email/password registration
│   └── profile.vue             # Change name, log out (auth-protected via middleware)
│
├── components/
│   ├── CarViewer.vue           # Fetches & displays all damages for a car (uses useCarDamages)
│   ├── CarDamageImage.vue      # Single damage card: photo, schematic overlay, lightbox
│   ├── CloudImageSelector.vue  # Upload to / browse Firebase Storage images
│   ├── DefaultPageStructure.vue# Page wrapper: back button, title slot, error alerts, content slot
│   ├── FirebaseNuxtImg.vue     # Converts Firebase Storage URLs to NuxtImg alias format
│   ├── HalfWidth.vue           # Centered column layout (max-w-[352px])
│   └── ui/                     # shadcn-vue primitives (alert, badge, button, input, label,
│                               #   select, slider, textarea) — DO NOT edit manually,
│                               #   regenerate with `npx shadcn-vue@latest add <component>`
│
├── composables/
│   ├── useTypes.ts             # Shared TypeScript types: CarSide, CarData, DamageEntry, DamageDetail
│   ├── useCarDamages.ts        # Composable: fetches car doc + damages subcollection from Firestore
│   ├── useUserData.ts          # Composable: fetches user doc from Firestore, provides isDamageReporter
│   └── states.ts               # Global reactive state: useUsername(), useLoginError()
│
├── lib/
│   └── utils.ts                # cn() helper (clsx + tailwind-merge)
│
├── assets/css/
│   └── tailwind.css            # Tailwind v4 entry: theme variables, light/dark mode tokens
│
├── public/
│   ├── carsharing_logo.svg     # App logo
│   ├── favicon.ico
│   └── robots.txt
│
└── scripts/
    └── python_helper_scripts/  # Offline maintenance scripts (Firestore doc copy/update/validate,
                                #   image path fixes). Uses Python + uv. Not part of the web app.
```

---

## 5. Firestore Data Model

```
Firestore root
├── cars/                           # Collection
│   ├── kangoo                      # Document (CarData: { id, title })
│   │   └── damages/                # Subcollection
│   │       └── {damageId}          # Document (DamageEntry)
│   │           ├── description: string
│   │           ├── imagePath: string        # Firebase Storage path
│   │           ├── side: "front"|"back"|"left"|"right"|"top"
│   │           ├── x: number (0-100)        # % position on schematic
│   │           ├── y: number (0-100)
│   │           ├── details: DamageDetail[]  # Array of { description, imagePath }
│   │           └── createdAt: Timestamp     # Added on upload
│   ├── kona
│   │   └── damages/ ...
│   └── zoe
│       └── damages/ ...
└── users/                          # Collection
    └── {userId}                    # Document (UserData)
        ├── damage_reporter: boolean         # Permission flag
        ├── email: string
        └── displayName: string
```

**Firebase Storage structure:**
```
cars/
├── kangoo/
│   ├── damages/          # Uploaded damage photos
│   └── schematics/       # kangoo_front.png, kangoo_back.png, kangoo_left.png, etc.
├── kona/
│   ├── damages/
│   └── schematics/
└── zoe/
    ├── damages/
    └── schematics/
```

---

## 6. Key Data Flow

### Viewing damages (e.g., `/kangoo`)

```
kangoo.vue
  └─ <CarViewer carId="kangoo">
       └─ useCarDamages({ carId: "kangoo" })
            ├─ useDocument()  → Firestore: cars/kangoo          → car ref
            └─ useCollection() → Firestore: cars/kangoo/damages → damageEntries ref (sorted by side, then x)
       └─ v-for damageEntry in damageEntries
            └─ <CarDamageImage :damageEntry :carId>
                 ├─ useStorageFileUrl() → damage photo URL
                 ├─ useStorageFileUrl() → schematic overlay URL
                 ├─ <FirebaseNuxtImg>  → converts URL to /firebase/ alias for NuxtImg optimization
                 └─ <VueEasyLightbox>  → detail images gallery on click
```

### Home page with permissions (`/`)

```
index.vue
  ├─ useCurrentUser() → current Firebase Auth user
  ├─ useUserData({ userId }) → Firestore: users/{userId} → userData ref
  │    └─ isDamageReporter computed → checks userData.damage_reporter === true
  └─ Show "Schaden melden" button only if isDamageReporter is true
```

### Reporting a damage (`/report-damage`, auth-protected)

```
report-damage.vue
  ├─ Select car (zoe/kona/kangoo)
  ├─ <CloudImageSelector storagePath="cars/{car}/damages">
  │    ├─ Upload photo → Firebase Storage (uploadBytes + getDownloadURL)
  │    └─ OR browse existing images (listAll)
  ├─ Select side → loads schematic from Storage
  ├─ Position marker (click on schematic or use sliders)
  ├─ Enter description
  └─ Submit → addDoc(cars/{car}/damages, { ...damageEntry, createdAt })
```

### Authentication flow

```
login.vue / register.vue
  ├─ signInWithPopup(GoogleAuthProvider) OR signInWithEmailAndPassword / createUserWithEmailAndPassword
  ├─ On success → set useUsername(), clear useLoginError(), navigateTo(redirect || "/")
  └─ On error → set useLoginError() → displayed by DefaultPageStructure's Alert

middleware/auth.ts
  └─ defineNuxtRouteMiddleware → getCurrentUser() → redirect to /login if null
  └─ Applied via definePageMeta({ middleware: "auth" }) on profile.vue and report-damage.vue
```

---

## 7. Component Relationships

```
app.vue
└─ <NuxtLayout> (layouts/default.vue)
    ├─ Logo + Title + Profile button
    └─ <NuxtPage> (pages/*.vue)
         └─ <DefaultPageStructure>
              ├─ Back button + title slot + error alerts
              └─ Page content (slot)
                   ├─ <HalfWidth> — used for narrow form layouts (index, login, register, profile)
                   ├─ <CarViewer> — used on car pages (kangoo, kona, zoe)
                   │    └─ <CarDamageImage> (per damage)
                   │         └─ <FirebaseNuxtImg> (damage photo + schematic)
                   └─ <CloudImageSelector> — used on report-damage page
                        └─ <FirebaseNuxtImg> (thumbnails in browser modal)
```

---

## 8. Environment Variables

Defined in `.env` (see `.env.example`):

- **`FIREBASE_WEBAPP_CONFIG`** — JSON string with Firebase project config (`apiKey`, `appId`, `authDomain`, `projectId`, `storageBucket`, etc.). Parsed at build time in `nuxt.config.ts` for both `vuefire.config` and `image.alias`.
- **`GOOGLE_APPLICATION_CREDENTIALS`** — Path to service account JSON (used by scripts, not the web app).

---

## 9. Code Style Rules

- **Prettier:** No semicolons, double quotes, trailing comma `es5`, print width 100, 2-space indent, LF line endings, `arrowParens: "avoid"`.
- **ESLint:** Nuxt flat config. `vue/html-self-closing` set to `warn` with relaxed rules for HTML elements.
- **Lint commands:** `npm run lint` (check), `npm run lint:fix` (auto-fix).

---

## 10. Common Pitfalls & Things to Know

1. **`ssr: false`** — There is no server-side rendering. All Firebase calls happen client-side. No `server/` API routes exist.
2. **`FirebaseNuxtImg`** is a wrapper that converts raw Firebase Storage download URLs into the `/firebase/` alias path so `@nuxt/image` can optimize them. Always use `<FirebaseNuxtImg>` instead of raw `<NuxtImg>` for Firebase Storage images.
3. **shadcn-vue components** live in `components/ui/` and should not be manually edited. Add new ones with `npx shadcn-vue@latest add <component>`.
4. **Types are defined in `composables/useTypes.ts`** and are auto-imported globally. `CarSide`, `CarData`, `DamageEntry`, `DamageDetail` can be used anywhere without imports.
5. **Global state** (`useUsername`, `useLoginError`) uses Nuxt's `useState` via `composables/states.ts` — also auto-imported.
6. **User permissions** are stored in Firestore `users/{userId}` collection. The `damage_reporter` boolean field controls access to the "Schaden melden" feature. Use `useUserData({ userId })` to fetch user data and check `isDamageReporter`.
7. **Car IDs** (`kangoo`, `kona`, `zoe`) are used as both Firestore document IDs and Firebase Storage path segments. They must match exactly.
8. **Schematic images** follow the naming convention `cars/{carId}/schematics/{carId}_{side}.png` in Firebase Storage.
9. **The `scripts/` directory** contains Python helper scripts for Firestore maintenance (copy docs, update URLs, validate, fix image paths). They use `uv` for dependency management and are completely separate from the Nuxt app.
10. **Firebase config is parsed from env at build time** — changing Firebase project requires rebuilding.
11. **The app language is German** — all UI text, labels, error messages, and placeholders are in German.
