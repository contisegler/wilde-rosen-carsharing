// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-01',
  devtools: { enabled: false },
  css: ['~/assets/main.scss'],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // This suppresses deprecation warnings from dependencies
          quietDeps: true
        }
      }
    }
  },
  modules: ['@vueuse/nuxt']
})