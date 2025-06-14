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

// Reactive arrays for sliders
const xPosition = ref([damageData.x])
const yPosition = ref([damageData.y])

// Watch for slider changes
watch(xPosition, (newVal) => {
  damageData.x = newVal[0]
})

watch(yPosition, (newVal) => {
  damageData.y = newVal[0]
})

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

// References for positioning and sizing
const schematicImage = ref<HTMLElement | null>(null)
const schematicContainer = ref<HTMLElement | null>(null)
const schematicHeight = ref(400) // Default height
const schematicWidth = ref(600) // Default width
const isSliderDragging = ref(false) // Flag to track if a slider is being dragged

// Update dimensions when image loads
onMounted(() => {
  // Wait for the image to load
  nextTick(() => {
    if (schematicImage.value) {
      // Set a small timeout to ensure image is fully rendered
      setTimeout(() => {
        if (schematicImage.value) {
          schematicHeight.value = schematicImage.value.offsetHeight
          schematicWidth.value = schematicImage.value.offsetWidth
          console.log(`Schematic dimensions: ${schematicWidth.value}x${schematicHeight.value}`)
        }
      }, 100)
    }
  })
  
  // Add global event listeners to ensure slider dragging state is reset
  window.addEventListener('pointerup', () => {
    isSliderDragging.value = false
  })
  
  window.addEventListener('pointercancel', () => {
    isSliderDragging.value = false
  })
})

const handleSchematicClick = (event: MouseEvent) => {
  // Skip if we're in the middle of a slider drag operation
  if (isSliderDragging.value) {
    return
  }
  
  // Get the target element and its dimensions
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  
  // Calculate position relative to the image
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  
  // Set the position values, ensuring they stay within 0-100%
  const roundedX = Math.max(0, Math.min(100, Math.round(x)))
  const roundedY = Math.max(0, Math.min(100, Math.round(y)))
  
  // Update both the damageData and the slider position arrays
  damageData.x = roundedX
  damageData.y = roundedY
  
  // Update the slider position arrays to keep them in sync
  xPosition.value = [roundedX]
  yPosition.value = [roundedY]
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
  <div class="w-full">
    <div v-if="!showJson" class="flex flex-wrap justify-center">
      <div class="w-full max-w-4xl">
        <div class="border rounded shadow">
          <div class="p-4 border-b flex justify-between items-center">
            <h5 class="mb-0">Damage Entry ({{ currentImageIndex + 1 }} of {{ damageImages.length }})</h5>
            <Button variant="outline" size="sm" type="button" @click="resetForm">
              Start Over
            </Button>
          </div>
          <div class="p-4">
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
                  <Label class="mb-2 block">Car Side</Label>
                  <Select v-model="damageData.side">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Select car side" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Car Sides</SelectLabel>
                        <SelectItem v-for="side in carSides" :key="side.value" :value="side.value">
                          {{ side.label }}
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <!-- Car Side Selection Only -->
                <!-- Position Controls moved to schematic area -->
                
                <!-- Description -->
                <div class="mb-3">
                  <Label for="description" class="mb-2 block">Description</Label>
                  <Textarea
                    id="description"
                    v-model="damageData.description"
                    rows="3"
                    class="w-full"
                    required
                  />
                </div>
              </div>
              
              <div class="w-full md:w-2/3">
                <!-- Combined Schematic and Sliders Container -->
                <div class="flex justify-center">
                  <!-- Y Label -->
                  <div class="w-8 text-center mr-2 flex items-center justify-center">
                    <Label class="transform -rotate-90 whitespace-nowrap">Y: {{ yPosition[0] }}%</Label>
                  </div>
                  
                  <!-- Main Schematic with Sliders -->
                  <div class="relative">
                    <!-- Y Slider (Left) -->
                    <div class="absolute left-0 top-0 h-full flex items-center">
                        <Slider
                          v-model="yPosition"
                          :min="0"
                          :max="100"
                          :step="1"
                          class="h-full w-2"
                          orientation="vertical"
                          :inverted="true"
                        />
                    </div>
                    
                    <!-- Schematic Image -->
                    <div class="schematic-preview pl-6">
                      <div class="relative inline-block" ref="schematicContainer">
                        <NuxtImg 
                          ref="schematicImage"
                          :src="getCarSchematicPath(damageData.side)" 
                          class="schematic-img" 
                          alt="Car side schematic"
                          loading="lazy"
                          format="webp"
                          quality="90"
                          sizes="sm:100vw md:80vw lg:60vw"
                          @mousedown="handleSchematicClick"
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
                        
                        <!-- X Slider (Bottom) -->
                        <div class="absolute bottom-0 left-0 w-full transform translate-y-6">
                          <div @mousedown.stop @click.stop>
                            <Slider
                              v-model="xPosition"
                              :min="0"
                              :max="100"
                              :step="1"
                              class="w-full"
                            />
                          </div>
                        </div>
                        
                        <!-- X Label -->
                        <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12">
                          <Label>X: {{ xPosition[0] }}%</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-between mt-4">
              <Button variant="outline" type="button" @click="previousImage" :disabled="currentImageIndex === 0">
                Previous Image
              </Button>
              <Button variant="default" type="button" @click="nextImage">
                {{ currentImageIndex < damageImages.length - 1 ? 'Next Image' : 'Finish' }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- JSON Output -->
    <div v-if="showJson" class="flex flex-wrap justify-center">
      <div class="w-full max-w-4xl">
        <div class="border rounded shadow">
          <div class="p-4 border-b flex justify-between items-center">
            <h5 class="mb-0">Damage Entries JSON</h5>
            <div>
              <Button variant="default" size="sm" type="button" class="mr-2" @click="copyToClipboard">
                Copy to Clipboard
              </Button>
              <Button variant="outline" size="sm" type="button" @click="resetForm">
                Start Over
              </Button>
            </div>
          </div>
          <div class="p-4">
            <pre class="bg-gray-100 p-3 rounded" style="max-height: 500px; overflow: auto;">{{ jsonOutput }}</pre>
            <div class="mt-3">
              <NuxtLink to="/">
                <Button variant="outline">Back to Home</Button>
              </NuxtLink>
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
