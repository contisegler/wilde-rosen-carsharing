// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-01',
  devtools: { enabled: false },
  css: ['~/assets/main.scss'],
  
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
  image: {
    // Use modern formats like WebP and AVIF when possible
    format: ['webp', 'avif', 'jpg', 'png'],
    // Set maximum width for images
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    // Set quality for different formats
    quality: 80,
    // Enable lazy loading by default
    loading: 'lazy',
    // Use responsive images
    responsive: {
      sizes: '100vw',
    },
    // Optimize images for different device sizes
    presets: {
      default: {
        modifiers: {
          format: 'webp',
          quality: 80,
          width: 1024,
          height: 1024,
        }
      },
      thumbnail: {
        modifiers: {
          format: 'webp',
          quality: 50,
          width: 320,
          height: 320
        }
      }
    }
  }
})