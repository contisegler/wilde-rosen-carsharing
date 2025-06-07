<script setup lang="ts">

const props = defineProps<{
  carModel: string
}>()

const damageData = reactive<DamageEntry>({
  path: '',
  side: 'front',
  x: 50,
  y: 50,
  description: ''
})

const entries = ref<DamageEntry[]>([])
const currentImageIndex = ref(0)
const showJson = ref(false)
const jsonOutput = ref('')

// Use the shared helper function to get damage images
const damageImages = ref<string[]>(getDamageImagesForModel(props.carModel))

// Use the shared car sides constant
const carSides = CAR_SIDES

// Use the shared helper function to get schematic path
const getCarSchematicPath = (side: string) => {
  return getSchematicPath(props.carModel, side)
}

// Initialize with first image
onMounted(() => {
  if (damageImages.value.length > 0) {
    damageData.path = damageImages.value[0]
  }
})

// Store temporary data for each image
const tempData = ref<Record<number, DamageEntry>>({})

const nextImage = () => {
  // Save current data to temp storage
  tempData.value[currentImageIndex.value] = { ...damageData }
  
  // Move to next image
  currentImageIndex.value++
  
  if (currentImageIndex.value < damageImages.value.length) {
    // Set path to current image
    damageData.path = damageImages.value[currentImageIndex.value]
    
    // Check if we have saved data for this image
    if (tempData.value[currentImageIndex.value]) {
      // Restore saved data
      const savedData = tempData.value[currentImageIndex.value]
      damageData.side = savedData.side
      damageData.x = savedData.x
      damageData.y = savedData.y
      damageData.description = savedData.description
    } else {
      // Set default values for new image
      damageData.side = 'front'
      damageData.x = 50
      damageData.y = 50
      damageData.description = ''
    }
  } else {
    // All images processed, prepare entries for JSON output
    const entriesArray = []
    // Convert object to array in the correct order
    for (let i = 0; i < damageImages.value.length; i++) {
      if (tempData.value[i]) {
        entriesArray.push(tempData.value[i])
      }
    }
    entries.value = entriesArray
    generateJsonOutput()
    showJson.value = true
  }
}

const previousImage = () => {
  // Save current data to temp storage
  tempData.value[currentImageIndex.value] = { ...damageData }
  
  // Move to previous image
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
    damageData.path = damageImages.value[currentImageIndex.value]
    
    // Restore saved data for the previous image
    if (tempData.value[currentImageIndex.value]) {
      const savedData = tempData.value[currentImageIndex.value]
      damageData.side = savedData.side
      damageData.x = savedData.x
      damageData.y = savedData.y
      damageData.description = savedData.description
    } else {
      // Default values if no saved data exists (shouldn't happen)
      damageData.side = 'front'
      damageData.x = 50
      damageData.y = 50
      damageData.description = ''
    }
  }
}

const generateJsonOutput = () => {
  jsonOutput.value = JSON.stringify(entries.value, null, 2)
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(jsonOutput.value)
  alert('Copied to clipboard!')
}

// References for positioning
const schematicImage = ref<HTMLElement | null>(null)
const schematicContainer = ref<HTMLElement | null>(null)

const handleSchematicClick = (event: MouseEvent) => {
  // Get the target element and its dimensions
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  
  // Calculate position relative to the image
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  
  // Set the position values, ensuring they stay within 0-100%
  damageData.x = Math.max(0, Math.min(100, Math.round(x)))
  damageData.y = Math.max(0, Math.min(100, Math.round(y)))
}

const resetForm = () => {
  currentImageIndex.value = 0
  damageData.path = damageImages.value.length > 0 ? damageImages.value[0] : ''
  damageData.side = 'front'
  damageData.x = 50
  damageData.y = 50
  damageData.description = ''
  entries.value = []
  tempData.value = {} // Clear all temporary data
  showJson.value = false
}
</script>

<template>
  <div class="w-100">
    <div v-if="!showJson" class="row justify-content-center">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Damage Entry ({{ currentImageIndex + 1 }} of {{ damageImages.length }})</h5>
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetForm">
              Start Over
            </button>
          </div>
          <div class="card-body">
            <!-- Current Image -->
            <div class="mb-4 text-center">
              <NuxtImg 
                :src="damageData.path" 
                class="img-fluid" 
                style="max-height: 500px; max-width: 100%; object-fit: contain;" 
                :alt="`Damage image ${currentImageIndex + 1}`"
              />
            </div>

            <!-- Side Selection with Schematic Preview -->
            <div class="row mb-4">
              <div class="col-md-4">
                <div class="mb-3">
                  <label class="form-label">Car Side</label>
                  <select v-model="damageData.side" class="form-select">
                    <option v-for="side in carSides" :key="side.value" :value="side.value">
                      {{ side.label }}
                    </option>
                  </select>
                </div>
                
                <!-- Position Controls -->
                <div class="mb-3">
                  <label class="form-label">X Position: {{ damageData.x }}%</label>
                  <input 
                    type="range" 
                    class="form-range" 
                    min="0" 
                    max="100" 
                    v-model.number="damageData.x"
                  >
                </div>

                <div class="mb-3">
                  <label class="form-label">Y Position: {{ damageData.y }}%</label>
                  <input 
                    type="range" 
                    class="form-range" 
                    min="0" 
                    max="100" 
                    v-model.number="damageData.y"
                  >
                </div>
                
                <!-- Description -->
                <div class="mb-3">
                  <label for="description" class="form-label">Description</label>
                  <textarea
                    class="form-control"
                    id="description"
                    v-model="damageData.description"
                    rows="3"
                    style="width: 100%;"
                    required
                  ></textarea>
                </div>
              </div>
              
              <div class="col-md-8">
                <div class="schematic-preview" style="background-color: #f8f9fa;">
                  <div class="position-relative" style="display: inline-block;">
                    <NuxtImg 
                      :src="getCarSchematicPath(damageData.side)" 
                      class="schematic-img" 
                      alt="Car side schematic"
                      loading="lazy"
                      format="webp"
                      quality="90"
                      sizes="sm:100vw md:80vw lg:60vw"
                      @click="handleSchematicClick"
                    />
                    <div 
                      class="damage-x-marker"
                      :style="{
                        left: `${damageData.x}%`,
                        top: `${damageData.y}%`
                      }"
                    >
                      X
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-between">
              <button 
                type="button" 
                class="btn btn-outline-secondary" 
                @click="previousImage"
                :disabled="currentImageIndex === 0"
              >
                Previous Image
              </button>
              <button type="button" class="btn btn-primary" @click="nextImage">
                {{ currentImageIndex < damageImages.length - 1 ? 'Next Image' : 'Finish' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- JSON Output -->
    <div v-if="showJson" class="row justify-content-center">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Damage Entries JSON</h5>
            <div>
              <button type="button" class="btn btn-sm btn-primary me-2" @click="copyToClipboard">
                Copy to Clipboard
              </button>
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetForm">
                Start Over
              </button>
            </div>
          </div>
          <div class="card-body">
            <pre class="bg-light p-3 rounded" style="max-height: 500px; overflow: auto;">{{ jsonOutput }}</pre>
            <div class="mt-3">
              <NuxtLink to="/" class="btn btn-outline-secondary">Back to Home</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schematic-preview {
  text-align: center;
  padding: 15px;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  background-color: #f8f9fa;
}

.schematic-img {
  cursor: crosshair;
  max-height: 400px;
  max-width: 100%;
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
  cursor: pointer;
  z-index: 10;
  pointer-events: none;
}
</style>
