<script setup lang="ts">
interface FormData {
  path: string
  side: string
  x: number
  y: number
  description: string
}

const props = defineProps<{
  carModel: string
}>()

const formData = reactive<FormData>({
  path: '',
  side: 'front',
  x: 50,
  y: 50,
  description: ''
})

const entries = ref<FormData[]>([])
const currentImageIndex = ref(0)
const showJson = ref(false)
const jsonOutput = ref('')

// List of Zoe damage images
const zoeImages = [
  '/damages/zoe/signal-2025-05-18-193248.jpeg',
  '/damages/zoe/signal-2025-05-18-193335.jpeg',
  '/damages/zoe/signal-2025-05-18-193348.jpeg',
  '/damages/zoe/signal-2025-05-18-193431.jpeg',
  '/damages/zoe/signal-2025-05-18-193504.jpeg',
  '/damages/zoe/signal-2025-05-18-193556.jpeg',
  '/damages/zoe/signal-2025-05-18-193635.jpeg',
  '/damages/zoe/signal-2025-05-18-193703.jpeg',
  '/damages/zoe/signal-2025-05-18-193723.jpeg',
  '/damages/zoe/signal-2025-05-18-193734.jpeg',
  '/damages/zoe/signal-2025-05-18-193750.jpeg',
  '/damages/zoe/signal-2025-05-18-193851.jpeg',
  '/damages/zoe/signal-2025-05-18-193929.jpeg'
]

const carSides = [
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
  { value: 'left', label: 'Left Side' },
  { value: 'right', label: 'Right Side' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' }
]

const getSchematicPath = (side: string) => {
  return `/car_line_drawings/zoe_${side}.png`
}

// Initialize with first image
onMounted(() => {
  if (zoeImages.length > 0) {
    formData.path = zoeImages[0]
  }
})

// Store temporary data for each image
const tempData = ref<Record<number, FormData>>({})

const nextImage = () => {
  // Save current data to temp storage
  tempData.value[currentImageIndex.value] = { ...formData }
  
  // Move to next image
  currentImageIndex.value++
  
  if (currentImageIndex.value < zoeImages.length) {
    // Set path to current image
    formData.path = zoeImages[currentImageIndex.value]
    
    // Check if we have saved data for this image
    if (tempData.value[currentImageIndex.value]) {
      // Restore saved data
      const savedData = tempData.value[currentImageIndex.value]
      formData.side = savedData.side
      formData.x = savedData.x
      formData.y = savedData.y
      formData.description = savedData.description
    } else {
      // Set default values for new image
      formData.side = 'front'
      formData.x = 50
      formData.y = 50
      formData.description = ''
    }
  } else {
    // All images processed, prepare entries for JSON output
    entries.value = Object.values(tempData.value)
    generateJsonOutput()
    showJson.value = true
  }
}

const previousImage = () => {
  // Save current data to temp storage
  tempData.value[currentImageIndex.value] = { ...formData }
  
  // Move to previous image
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
    formData.path = zoeImages[currentImageIndex.value]
    
    // Restore saved data for the previous image
    if (tempData.value[currentImageIndex.value]) {
      const savedData = tempData.value[currentImageIndex.value]
      formData.side = savedData.side
      formData.x = savedData.x
      formData.y = savedData.y
      formData.description = savedData.description
    } else {
      // Default values if no saved data exists (shouldn't happen)
      formData.side = 'front'
      formData.x = 50
      formData.y = 50
      formData.description = ''
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
  formData.x = Math.max(0, Math.min(100, Math.round(x)))
  formData.y = Math.max(0, Math.min(100, Math.round(y)))
}

const resetForm = () => {
  currentImageIndex.value = 0
  formData.path = zoeImages[0]
  formData.side = 'front'
  formData.x = 50
  formData.y = 50
  formData.description = ''
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
            <h5 class="mb-0">Damage Entry ({{ currentImageIndex + 1 }} of {{ zoeImages.length }})</h5>
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetForm">
              Start Over
            </button>
          </div>
          <div class="card-body">
            <!-- Current Image -->
            <div class="mb-4 text-center">
              <NuxtImg 
                :src="formData.path" 
                class="img-fluid" 
                style="max-height: 500px; max-width: 100%; object-fit: contain;" 
                :alt="`Damage image ${currentImageIndex + 1}`"
                loading="lazy"
                format="webp"
                quality="90"
                sizes="sm:100vw md:90vw lg:70vw"
              />
            </div>

            <!-- Side Selection with Schematic Preview -->
            <div class="row mb-4">
              <div class="col-md-4">
                <div class="mb-3">
                  <label class="form-label">Car Side</label>
                  <select v-model="formData.side" class="form-select">
                    <option v-for="side in carSides" :key="side.value" :value="side.value">
                      {{ side.label }}
                    </option>
                  </select>
                </div>
                
                <!-- Position Controls -->
                <div class="mb-3">
                  <label class="form-label">X Position: {{ formData.x }}%</label>
                  <input 
                    type="range" 
                    class="form-range" 
                    min="0" 
                    max="100" 
                    v-model.number="formData.x"
                  >
                </div>

                <div class="mb-3">
                  <label class="form-label">Y Position: {{ formData.y }}%</label>
                  <input 
                    type="range" 
                    class="form-range" 
                    min="0" 
                    max="100" 
                    v-model.number="formData.y"
                  >
                </div>
                
                <!-- Description -->
                <div class="mb-3">
                  <label for="description" class="form-label">Description</label>
                  <input
                    type="text"
                    class="form-control"
                    id="description"
                    v-model="formData.description"
                    required
                  />
                </div>
              </div>
              
              <div class="col-md-8">
                <div class="schematic-preview" style="background-color: #f8f9fa;">
                  <div class="position-relative" style="display: inline-block;">
                    <NuxtImg 
                      :src="getSchematicPath(formData.side)" 
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
                        left: `${formData.x}%`,
                        top: `${formData.y}%`
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
                {{ currentImageIndex < zoeImages.length - 1 ? 'Next Image' : 'Finish' }}
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
