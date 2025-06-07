// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-01',
  devtools: { enabled: false },
  css: ['~/assets/main.scss'],
  
  // App configuration
  appConfig: {
    appName: 'Wilde Rosen Carsharing', // Application name
    version: '1.0.0', // Application version
  },

  // TypeScript configuration
  typescript: {
    typeCheck: true,
    strict: true
  },

  // App configuration
  app: {
    head: {
      title: 'Wilde Rosen Carsharing', // default fallback title
      htmlAttrs: {
        lang: 'de',
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ]
    }
  },
    
  // Vite configuration
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true
        }
      }
    },
  },
  
  
  // Modules
  modules: ['@nuxt/image', 'nuxt-easy-lightbox'],
  
  // Image module configuration
  image: {}
  
  // // Nitro configuration for optimized server
  // nitro: {
  //   compressPublicAssets: true,
  //   minify: true,
  //   // Optimize Firebase hosting
  //   preset: 'firebase'
  // }
})