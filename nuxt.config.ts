// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-05-18',
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
      firebase: `https://firebasestorage.googleapis.com/v0/b/${JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG || '{}').storageBucket}/o`
    }
  },
  appConfig: {
    firebase: {
      emulators: false,
      webAppConfig: JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG || '{}'),
    }
  }
})