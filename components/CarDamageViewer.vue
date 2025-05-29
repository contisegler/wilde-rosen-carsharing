<script setup lang="ts">
// Component for displaying car damage images with schematics

interface Props {
  damageImages: DamageEntry[]
  carModel: string
}

const props = defineProps<Props>()

// State for modal/lightbox
const showModal = ref(false)
const currentImagePath = ref('')
const imageScale = ref(1)
const startX = ref(0)
const startY = ref(0)
const translateX = ref(0)
const translateY = ref(0)

// Generate schematic path based on car model and side
const getSchematicPath = (side: string) => {
  return `/car_line_drawings/${props.carModel}_${side}.png`
}

// Open the modal with the selected image
const openModal = (imagePath: string) => {
  // Ensure the path is absolute (add leading slash if missing)
  currentImagePath.value = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  showModal.value = true
  // Reset zoom and position
  imageScale.value = 1
  translateX.value = 0
  translateY.value = 0
  // Prevent body scrolling when modal is open
  document.body.style.overflow = 'hidden'
  console.log('Opening modal with image:', currentImagePath.value)
}

// Close the modal
const closeModal = () => {
  showModal.value = false
  // Re-enable body scrolling
  document.body.style.overflow = 'auto'
}

// Handle zoom in/out
const zoomIn = () => {
  if (imageScale.value < 3) {
    imageScale.value += 0.5
  }
}

const zoomOut = () => {
  if (imageScale.value > 1) {
    imageScale.value -= 0.5
  }
}

// Handle touch events for mobile pinch zoom
// Track if mouse is down for dragging
const isDragging = ref(false)

// Handle mouse events for dragging
const handleMouseDown = (event: MouseEvent) => {
  if (imageScale.value > 1) {
    isDragging.value = true
    startX.value = event.clientX - translateX.value
    startY.value = event.clientY - translateY.value
    event.preventDefault()
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value && imageScale.value > 1) {
    translateX.value = event.clientX - startX.value
    translateY.value = event.clientY - startY.value
    event.preventDefault()
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

// Handle touch events for mobile panning
const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length === 1 && imageScale.value > 1) {
    // Single touch - prepare for panning
    startX.value = event.touches[0].clientX - translateX.value
    startY.value = event.touches[0].clientY - translateY.value
  }
}

const handleTouchMove = (event: TouchEvent) => {
  if (event.touches.length === 1 && imageScale.value > 1) {
    // Single touch - handle panning when zoomed in
    event.preventDefault()
    translateX.value = event.touches[0].clientX - startX.value
    translateY.value = event.touches[0].clientY - startY.value
  }
}

// Close modal when clicking outside the image
const handleBackdropClick = (event: MouseEvent) => {
  if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
    closeModal()
  }
}
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
                  @click="openModal(image.path)"
                />
              </div>
              
              <!-- Schematic Overlay -->
              <div class="schematic-overlay">
                <div class="position-relative">
                  <div class="schematic-image-container">
                    <NuxtImg 
                      :src="getSchematicPath(image.side)" 
                      class="schematic-image" 
                      :alt="'Schematic for ' + props.carModel  + ' ' + image.side + ' side'"
                      loading="lazy"
                      format="webp"
                      quality="60"
                      sizes="sm:30vw md:20vw lg:200px"
                      provider="ipx"
                      fit="contain"
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
  
  <!-- Image Modal/Lightbox -->
  <div v-if="showModal" class="modal-backdrop" @click="handleBackdropClick">
    <div class="modal-content">
      <button class="close-button" @click="closeModal">×</button>
      
      <div class="zoom-controls">
        <button class="zoom-button" @click="zoomOut">-</button>
        <span>{{ Math.round(imageScale * 100) }}%</span>
        <button class="zoom-button" @click="zoomIn">+</button>
      </div>
      
      <div class="image-container"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      >
        <img
          :src="currentImagePath"
          class="modal-image"
          alt="Enlarged damage image"
          :style="{
            transform: `scale(${imageScale}) translate(${translateX}px, ${translateY}px)`,
            cursor: imageScale > 1 ? 'move' : 'default'
          }"
          draggable="false"
        />
      </div>
    </div>
  </div>
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
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow: hidden;
}

.modal-content {
  position: relative;
  width: 90%;
  height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  touch-action: none; /* Disable browser's touch actions */
}

.modal-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  transition: transform 0.1s ease-out;
  transform-origin: center center;
  display: block;
  margin: 0 auto;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 24px;
  cursor: pointer;
  z-index: 1001;
}

.zoom-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1001;
}

.zoom-button {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

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
