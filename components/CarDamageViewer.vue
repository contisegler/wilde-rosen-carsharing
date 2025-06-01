<script setup lang="ts">
// Component for displaying car damage images with schematics
// Using Nuxt's auto-generated types for components

// Easy Lightbox state
const visibleRef = ref(false)
const indexRef = ref(0)
const lightboxImages = ref<string[]>([])

// Show image in lightbox
const showImg = (index: number) => {
  indexRef.value = index
  visibleRef.value = true
}

// Hide lightbox
const onHide = () => {
  visibleRef.value = false
}

// Use the image optimization composable
const { getOptimizedImageProps } = useImageOptimization()

interface Props {
  damageImages: DamageEntry[]
  carModel: string
}

const props = defineProps<Props>()

// Use the shared getSchematicPath function with the car model from props
const getCarSchematicPath = (side: string) => {
  return getSchematicPath(props.carModel, side)
}

// Initialize lightbox images from damage entries
watchEffect(() => {
  if (props.damageImages && props.damageImages.length > 0) {
    lightboxImages.value = props.damageImages.map(entry => entry.path)
  }
})

// Get optimized image props for different sizes
const thumbnailProps = getOptimizedImageProps('thumbnail')
const largeImageProps = getOptimizedImageProps('large')
</script>

<template>
  <div class="container py-4">
    <div class="row">
      <div class="col-12 mx-auto">
        <!-- All Damage Images -->
        <div class="damage-list">
          <div v-for="(image, index) in damageImages" :key="index" class="damage-item mb-5">
            <div class="position-relative damage-container">
              <!-- Main Damage Image with NuxtImg -->
              <div class="damage-image-container">
                <NuxtImg 
                  :src="image.path" 
                  class="damage-image clickable" 
                  alt="Car damage image"
                  loading="lazy"
                  format="webp"
                  quality="80"
                  sizes="sm:100vw md:80vw lg:600px"
                  provider="ipx"
                  fit="contain"
                  @click="() => showImg(index)"
                />
              </div>
              
              <!-- Schematic Overlay -->
              <div class="schematic-overlay">
                <div class="position-relative">
                  <div class="schematic-image-container">
                    <NuxtImg 
                      :src="getCarSchematicPath(image.side)" 
                      class="schematic-image" 
                      :alt="'Schematic for ' + props.carModel  + ' ' + image.side + ' side'"
                      v-bind="getOptimizedImageProps('thumbnail')"
                    />
                  </div>
                  <div class="damage-x-marker" :style="{ left: image.x + '%', top: image.y + '%' }">
                    X
                  </div>
                </div>
              </div>
              
              <!-- Description directly in the container -->
              <div class="damage-description">
                <p>{{ image.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Use VueEasyLightbox -->
  <VueEasyLightbox
    :visible="visibleRef"
    :imgs="lightboxImages"
    :index="indexRef"
    @hide="onHide"
  />
</template>

<style scoped>
.card {
  transition: transform 0.3s ease;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.damage-container {
  position: relative;
  overflow: hidden;
  margin-bottom: 2rem;
}

.damage-image-container {
  width: 100%;
  max-height: 600px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.damage-image {
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: contain;
}

.schematic-image-container {
  width: 100%;
  max-width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.schematic-image {
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

.schematic-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  max-width: 30%;
  z-index: 10;
}

.schematic-image {
  width: 100%;
  display: block;
  opacity: 0.7;
}

.damage-x-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  color: red;
  font-weight: bold;
  font-size: 24px;
  text-shadow: 
    -1px -1px 0 #fff,
    1px -1px 0 #fff,
    -1px 1px 0 #fff,
    1px 1px 0 #fff;
}

.damage-description {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  padding: 10px 15px;
  font-size: 14px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.damage-description p {
  margin: 0;
}

/* Clickable image styles */
.clickable {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.clickable:hover {
  transform: scale(1.02);
}

/* Modal/Lightbox styles */
/* Modal styles moved to ImageModal.vue component */

@media (max-width: 768px) {
  .damage-image {
    max-height: 450px;
  }
  
  .schematic-overlay {
    max-width: 40%;
    top: 5px;
    right: 5px;
    padding: 3px;
  }
  
  .damage-x-marker {
    font-size: 16px;
  }
  
  .damage-description {
    padding: 8px 10px;
    font-size: 12px;
  }
  
  .modal-content {
    width: 100%;
    height: 100%;
  }
  
  .close-button {
    top: 10px;
    right: 10px;
  }
}
</style>
