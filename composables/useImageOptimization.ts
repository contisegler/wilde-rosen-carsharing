/**
 * Composable for image optimization
 * Provides methods for optimizing images with NuxtImg
 */

export function useImageOptimization() {
  /**
   * Get optimized image props for NuxtImg based on size preset
   * @param size - Size preset: thumbnail, medium, or large
   * @returns Object with props for NuxtImg component
   */
  function getOptimizedImageProps(size: 'thumbnail' | 'medium' | 'large') {
    // Base props for all images
    const baseProps = {
      format: 'webp',
      loading: 'lazy' as 'lazy', // Type assertion to match NuxtImg requirements
    }
    
    // Size-specific props
    switch (size) {
      case 'thumbnail':
        return {
          ...baseProps,
          quality: 70,
          sizes: 'sm:100px md:150px lg:200px',
          placeholder: true,
        }
      case 'medium':
        return {
          ...baseProps,
          quality: 80,
          sizes: 'sm:300px md:400px lg:500px',
        }
      case 'large':
        return {
          ...baseProps,
          quality: 90,
          sizes: 'sm:100vw md:80vw lg:60vw',
        }
      default:
        return baseProps
    }
  }

  return {
    getOptimizedImageProps
  }
}
