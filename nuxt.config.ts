// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
  hooks: {
    'build:before': () => {
      console.log('\n=== Nuxt Config at Build Time ===')
      console.log('NODE_ENV:', process.env.NODE_ENV)
      console.log('SSR:', true)
      console.log('Dev mode:', process.env.NODE_ENV !== 'production')
      console.log('Image firebase alias: ', 'https://firebasestorage.googleapis.com/v0/b/' + JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG || "").storageBucket + '/o')
      console.log('\nVueFire Config:')
      console.log('  - Auth enabled:', true)
      console.log('  - SessionCookie:', process.env.NODE_ENV === "production")
      console.log('  - Firebase config present:', !!process.env.FIREBASE_WEBAPP_CONFIG)
      console.log('  - Firebase config:\n', JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG || ""))
      console.log('\nCredentials:')
      console.log('  - FIREBASE_CONFIG (App Hosting):', process.env.FIREBASE_CONFIG || false)
      console.log('  - GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS || 'not set (using ADC)')
      console.log('\nBuild Info:')
      console.log('  - TypeScript strict:', true)
      console.log('  - TypeScript typeCheck:', true)
      console.log('  - Devtools:', false)
      console.log('=================================\n')
    }
  },
  compatibilityDate: "2025-05-01",
  devtools: { enabled: false },
  css: ["~/assets/css/tailwind.css"],
  ssr: true,

  // App configuration
  appConfig: {
    appName: "Wilde Rosen Carsharing", // Application name
    version: "1.0.0", // Application version
  },

  // TypeScript configuration
  typescript: {
    typeCheck: true,
    strict: true,
  },

  // App configuration
  app: {
    head: {
      title: "Wilde Rosen Carsharing", // default fallback title
      htmlAttrs: {
        lang: "de",
      },
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  // Vite configuration
  vite: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- upstream type mismatch between @tailwindcss/vite and Vite 7
    plugins: [tailwindcss() as any],
  },

  // Modules
  modules: [
    "@nuxt/image",
    "nuxt-easy-lightbox",
    "shadcn-nuxt",
    "@nuxt/eslint",
    "nuxt-vuefire",
    "nuxt-lucide-icons",
  ],

  // Image module configuration
  image: {
    domains: ["firebasestorage.googleapis.com"],
    alias: {
      firebase: 'https://firebasestorage.googleapis.com/v0/b/' + JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG || "").storageBucket + '/o'
    },
  },

  // shadcn-nuxt configuration
  shadcn: {
    prefix: "",
    componentDir: "./components/ui",
  },

  vuefire: {
    auth: {
      enabled: true,
      // Session cookies require custom token signing, which doesn't work with ADC locally
      // Enable only in production (App Hosting) where metadata server is accessible
      sessionCookie: process.env.NODE_ENV === "production",
    },
    config: JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG || ""),
  },

  // // Nitro configuration for optimized server
  // nitro: {
  //   compressPublicAssets: true,
  //   minify: true,
  //   // Optimize Firebase hosting
  //   preset: 'firebase'
  // }
})
