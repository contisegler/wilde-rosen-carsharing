// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxt/ui', '@nuxt/image', 'nuxt-easy-lightbox'],
  css: ['~/assets/css/main.css'],
  ui: {
    colorMode: false,
  },
  vite: {
    optimizeDeps: {
      include: [
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/storage',
        'zod',
      ]
    }
  },
  image: {
    domains: ['firebasestorage.googleapis.com'],
    alias: {
      firebase: `https://firebasestorage.googleapis.com/v0/b/${process.env.NUXT_FIREBASE_STORAGE_BUCKET}/o`
    }
  },
  appConfig: {
    firebase: {
      emulators: false,
    }
  },
  runtimeConfig: {
    firebaseServiceAccount: process.env.NUXT_FIREBASE_SERVICE_ACCOUNT,
    public: {
      firebaseApiKey: process.env.NUXT_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.NUXT_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.NUXT_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.NUXT_FIREBASE_APP_ID,
    }
  }
})