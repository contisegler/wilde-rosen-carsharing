<script setup lang="ts">
// Image modal/lightbox component with zoom and pan functionality

const props = defineProps<{
  isOpen: boolean
  imagePath: string
}>()

const emit = defineEmits<{
  close: []
}>()

// Use the image zoom and pan functionality
const {
  imageScale,
  translateX,
  translateY,
  isDragging,
  zoomIn,
  zoomOut,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleTouchStart,
  handleTouchMove,
  handleBackdropClick
} = useImageZoomPan()

// Close the modal
function closeModal() {
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="modal-backdrop" @click="handleBackdropClick">
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
        <NuxtImg 
          :src="imagePath" 
          class="modal-image"
          :style="{
            transform: `scale(${imageScale}) translate(${translateX}px, ${translateY}px)`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }"
          alt="Enlarged image"
          loading="lazy"
          format="webp"
          quality="90"
          sizes="sm:100vw md:90vw lg:80vw"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  overflow: hidden;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 20px;
  cursor: pointer;
  z-index: 1010;
}

.zoom-controls {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 20px;
  padding: 5px 15px;
  display: flex;
  align-items: center;
  z-index: 1010;
}

.zoom-button {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0 10px;
}

.image-container {
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transform-origin: center;
  transition: transform 0.1s ease-out;
  user-select: none;
}
</style>
