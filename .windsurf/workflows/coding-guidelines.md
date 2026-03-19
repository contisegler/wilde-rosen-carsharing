---
description: Coding style and conventions for Wilde Rosen Carsharing
---

# Coding Guidelines for Wilde Rosen Carsharing

## Auto-Import Rules (CRITICAL)

**DO NOT add explicit imports for:**
- Vue functions: `ref`, `computed`, `watch`, `onMounted`, etc.
- Nuxt composables: `useRoute`, `navigateTo`, `definePageMeta`, etc.
- VueFire composables: `useFirestore`, `useCurrentUser`, `useFirebaseAuth`, `useFirebaseStorage`, `useDocument`, `useCollection`, `useStorageFileUrl`, `getCurrentUser`
- Project composables: `useCarDamages`, `useUserData`
- Components in `components/` directory
- Types from `composables/useTypes.ts`: `CarSide`, `CarData`, `DamageEntry`, `DamageDetail`
- Global state composables: `useUsername`, `useLoginError`

**DO add explicit imports for:**
- Type imports: `import type { FirestoreDataConverter } from "firebase/firestore"`
- Firebase SDK functions: `signInWithPopup`, `addDoc`, `collection`, `doc`, `ref as storageRef`, `uploadBytes`, etc.

## Code Style (Prettier + ESLint)

- **No semicolons**
- **Double quotes** for strings
- **Trailing comma**: `es5`
- **Print width**: 100 characters
- **Indent**: 2 spaces
- **Line endings**: LF
- **Arrow parens**: avoid (e.g., `x => x + 1`)
- **Self-closing tags**: Relaxed for HTML elements

Run `npm run lint:fix` to auto-format.

## Component Guidelines

### shadcn-vue Components
- Located in `components/ui/`
- **NEVER edit manually**
- Add new components: `npx shadcn-vue@latest add <component>`
- Style: New York, base color: neutral

### Firebase Images
- **Always use `<FirebaseNuxtImg>`** instead of `<NuxtImg>` for Firebase Storage images
- `FirebaseNuxtImg` converts raw Storage URLs to `/firebase/` alias for optimization
- Pass through all NuxtImg props via `$attrs`

### Image Rotation Fix
- Use `rotate: 'undefined'` (as string) in modifiers to trigger EXIF auto-rotation
- Never use `rotate: null` (causes crashes in @nuxt/image v2)

## TypeScript

- **Strict mode enabled**
- Type checking active
- Define shared types in `composables/useTypes.ts` (auto-imported)

## Firebase Conventions

- **Car IDs**: `kangoo`, `kona`, `zoe` (must match exactly in Firestore & Storage)
- **Storage paths**: `cars/{carId}/damages/`, `cars/{carId}/schematics/`
- **Schematic naming**: `{carId}_{side}.png` (e.g., `kangoo_front.png`)
- **Firestore structure**: 
  - Cars: `cars/{carId}/damages/{damageId}`
  - Users: `users/{userId}` with `damage_reporter` boolean field

## User Permissions

- **Permission system**: Stored in Firestore `users/{userId}` collection
- **damage_reporter flag**: Controls access to "Schaden melden" feature
- **Usage**: `const { isDamageReporter } = useUserData({ userId })`
- **Note**: Separate from Firebase Auth — authenticated users may not have reporting permission

## Language

- **All UI text, labels, errors, and placeholders MUST be in German**

## Architecture Notes

- **SPA mode** (`ssr: false`) — no server-side rendering
- No `server/` directory — all Firebase calls are client-side
- File-based routing in `pages/`
- Auth middleware: `definePageMeta({ middleware: "auth" })`
