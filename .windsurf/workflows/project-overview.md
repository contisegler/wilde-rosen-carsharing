---
description: Project overview and architecture reference
---

# Wilde Rosen Carsharing — Project Overview

## Quick Reference

**Full technical documentation**: See `/home/hendrikpreuss/wilde-rosen-carsharing/TECHNICAL_OVERVIEW.md`

## What This Is

A **German-language** carsharing damage-tracking web app for the "Wilde Rosen" community.

**Key Features:**
- View damages for 4 shared cars (Kangoo, Kona, Zoe, Jogger) with photos & schematics
- Report new damages with photo upload, marker positioning, and descriptions
- Google/email authentication via Firebase Auth
- Profile management

## Tech Stack Summary

- **Framework**: Nuxt 3 (v3.17.5) in SPA mode (`ssr: false`)
- **Language**: TypeScript (strict mode)
- **UI**: shadcn-vue (New York style) + Tailwind CSS v4
- **Icons**: Lucide (auto-imported via `nuxt-lucide-icons`)
- **Backend**: Firebase (Firestore, Storage, Auth) via `nuxt-vuefire`
- **Image Optimization**: `@nuxt/image` v2 with Firebase Storage alias
- **Deployment**: Firebase App Hosting

## Project Structure

```
├── pages/              # File-based routing (index, kangoo, kona, zoe, jogger, report-damage, login, register, profile)
├── components/         # Auto-imported components (CarViewer, CarDamageImage, CloudImageSelector, etc.)
│   └── ui/            # shadcn-vue primitives (DO NOT edit manually)
├── composables/        # useTypes.ts, useCarDamages.ts, states.ts (auto-imported)
├── layouts/           # default.vue (app shell)
├── middleware/        # auth.ts (route guard)
├── lib/               # utils.ts (cn() helper)
├── assets/css/        # Tailwind v4 entry
├── public/            # Static assets (logo, favicon)
└── scripts/           # Python helper scripts (separate from web app)
```

## Firestore Data Model

```
cars/
├── kangoo/
│   └── damages/
│       └── {damageId}
│           ├── description: string
│           ├── imagePath: string (Storage path)
│           ├── side: "front"|"back"|"left"|"right"|"top"
│           ├── x, y: number (0-100, % position)
│           ├── details: DamageDetail[]
│           └── createdAt: Timestamp
├── kona/damages/...
└── zoe/damages/...
└── jogger/damages/...

users/
└── {userId}
    ├── damage_reporter: boolean (permission flag)
    ├── email: string
    └── displayName: string
```

## Common Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Check code style
npm run lint:fix         # Auto-fix linting issues
npm run copy-car         # Copy car data (admin script)
```

## Environment Variables

- `FIREBASE_WEBAPP_CONFIG` — Firebase project config (JSON string)
- `GOOGLE_APPLICATION_CREDENTIALS` — Service account path (for scripts only)

## Critical Reminders

1. **Auto-imports are ON** — Don't import Vue/Nuxt/VueFire composables or components
2. **Use `<FirebaseNuxtImg>`** for all Firebase Storage images
3. **SPA mode** — No SSR, all client-side
4. **German language** — All UI text must be in German
5. **Car IDs** — Must match exactly: `kangoo`, `kona`, `zoe`, `jogger`  
6. **User permissions** — Use `useUserData({ userId })` to check `isDamageReporter` for damage reporting access
