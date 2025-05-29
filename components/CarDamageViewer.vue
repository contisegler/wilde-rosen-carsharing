<script setup>
// Component for displaying car damage images with schematics

// Props definition
const props = defineProps({
  damageImages: {
    type: Array,
    required: true,
    // Expected format for each item:
    // {
    //   path: String (path to damage image),
    //   description: String (damage description),
    //   x: Number (percentage from left),
    //   y: Number (percentage from top),
    //   side: String (car side - front, back, left, right, etc.)
    // }
  },
  carModel: {
    type: String,
    required: true,
    description: 'The model of the car (e.g., kona, tucson, etc.)'
  },
  title: {
    type: String,
    default: 'Car Damage Inspection'
  }
})

// Generate schematic path based on car model and side
const getSchematicPath = (side) => {
  return `/car_line_drawings/${props.carModel}_${side}.png`
}
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
              <!-- Main Damage Image with NuxtImg -->
              <div class="damage-image-container">
                <NuxtImg 
                  :src="image.path" 
                  class="damage-image" 
                  alt="Car damage image"
                  loading="lazy"
                  format="webp"
                  quality="80"
                  sizes="sm:100vw md:80vw lg:600px"
                  provider="ipx"
                  fit="contain"
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
