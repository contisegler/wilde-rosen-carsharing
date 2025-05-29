<script setup>
// Component for displaying car damage images with schematics

// Props definition
const props = defineProps({
  damageImages: {
    type: Array,
    required: true,
    // Expected format for each item:
    // {
    //   damagePath: String (path to damage image),
    //   schematicPath: String (path to schematic image),
    //   title: String (damage title),
    //   description: String (damage description),
    //   x: Number (percentage from left),
    //   y: Number (percentage from top),
    //   side: String (car side - front, back, left, right, etc.)
    // }
  },
  title: {
    type: String,
    default: 'Car Damage Inspection'
  }
});
</script>

<template>
  <div class="container py-4">
    <h1 class="text-center mb-4">{{ title }}</h1>
    
    <div class="row">
      <div class="col-12 mx-auto">
        <!-- All Damage Images -->
        <div class="damage-list">
          <div v-for="(image, index) in damageImages" :key="index" class="damage-item mb-5">
            <div class="position-relative damage-container">
              <!-- Main Damage Image -->
              <img :src="image.damagePath" class="img-fluid damage-image" :alt="image.title">
              
              <!-- Schematic Overlay -->
              <div class="schematic-overlay">
                <div class="position-relative">
                  <img :src="image.schematicPath" class="schematic-image" :alt="'Schematic for ' + image.title">
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

.damage-image {
  object-fit: contain;
  width: 100%;
  max-height: 600px;
  display: block;
  margin: 0 auto;
}

.schematic-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border-radius: 5px;
  padding: 5px;
  z-index: 10;
  max-width: 30%;
  opacity: 0.8;
}

.schematic-image {
  width: 100%;
  display: block;
  opacity: 0.9;
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
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
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
}
</style>
