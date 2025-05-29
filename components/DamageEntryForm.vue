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

const nextImage = () => {
  // Save current entry
  entries.value.push({ ...formData })
  
  // Move to next image
  currentImageIndex.value++
  if (currentImageIndex.value < zoeImages.length) {
    formData.path = zoeImages[currentImageIndex.value]
    formData.side = 'front'
    formData.x = 50
    formData.y = 50
    formData.description = ''
  } else {
    // All images processed, show JSON
    generateJsonOutput()
    showJson.value = true
  }
}

const generateJsonOutput = () => {
  jsonOutput.value = JSON.stringify(entries.value, null, 2)
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(jsonOutput.value)
  alert('Copied to clipboard!')
}

// Reference to the schematic image element
const schematicImage = ref<HTMLElement | null>(null)

const handleSchematicClick = (event: MouseEvent) => {
  // Only handle clicks on the image itself
  const target = event.currentTarget as HTMLElement
  const container = target.parentElement
  
  if (!container) return
  
  // Get the bounding rectangle of the image
  const rect = target.getBoundingClientRect()
  
  // Calculate position relative to the image dimensions only
  const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100))
  const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))
  
  formData.x = Math.round(x)
  formData.y = Math.round(y)
}

const resetForm = () => {
  currentImageIndex.value = 0
  formData.path = zoeImages[0]
  formData.side = 'front'
  formData.x = 50
  formData.y = 50
  formData.description = ''
  entries.value = []
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
                <div class="schematic-preview position-relative" style="min-height: 400px; background-color: #f8f9fa;">
                  <div class="position-relative" style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
                    <NuxtImg 
                      :src="getSchematicPath(formData.side)" 
                      class="img-fluid schematic-img" 
                      alt="Car side schematic"
                      style="max-height: 400px; width: auto; object-fit: contain; position: relative;"
                      loading="lazy"
                      format="webp"
                      quality="90"
                      sizes="sm:100vw md:80vw lg:60vw"
                      @click="handleSchematicClick"
                      ref="schematicImage"
                    />
                    <div 
                      class="damage-x-marker"
                      :style="{
                        left: `${formData.x}%`,
                        top: `${formData.y}%`,
                        position: 'absolute'
                      }"
                    >
                      X
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-between">
              <NuxtLink to="/" class="btn btn-outline-secondary">Back to Home</NuxtLink>
              <button type="button" class="btn btn-primary" @click="nextImage">
                {{ currentImageIndex < zoeImages.length - 1 ? 'Next Image' : 'Finish' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- JSON Output -->
    <div v-else class="row justify-content-center">
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
  position: relative;
  width: 100%;
  min-height: 400px;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  overflow: hidden;
  background-color: #f8f9fa;
  display: flex;
  justify-content: center;
  align-items: center;
}

.schematic-img {
  cursor: crosshair;
  display: block;
  margin: 0 auto;
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
