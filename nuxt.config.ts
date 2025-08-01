// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite"

// console.log("FIREBASE_WEBAPP_CONFIG at build:", process.env.FIREBASE_WEBAPP_CONFIG)

export default defineNuxtConfig({
  compatibilityDate: "2025-05-01",
  devtools: { enabled: false },
  css: ["~/assets/css/tailwind.css"],
  ssr: false,

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
    plugins: [tailwindcss()],
  },

  // Modules
  modules: ["@nuxt/image", "nuxt-easy-lightbox", "shadcn-nuxt", "@nuxt/eslint", "nuxt-vuefire"],

  // Image module configuration
  image: {
    domains: ["firebasestorage.googleapis.com"],
  },

  // shadcn-nuxt configuration
  shadcn: {
    prefix: "",
    componentDir: "./components/ui",
  },

  vuefire: {
    auth: {
      enabled: true,
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
