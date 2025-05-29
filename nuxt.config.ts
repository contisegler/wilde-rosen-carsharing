// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-01',
  devtools: { enabled: false },
  css: ['~/assets/main.scss'], 
  typescript: {
    typeCheck: true
  },
  
  // Vite configuration
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true
        }
      }
    }
  },
  
  // Modules
  modules: ['@nuxt/image'],
  
  // Image module configuration
  image: {}
})