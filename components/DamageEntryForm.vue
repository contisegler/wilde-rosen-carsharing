<script setup lang="ts">
interface FormData {
  image: File | null
  imagePreview: string | null
  side: string
  x: number
  y: number
  description: string
}

const props = defineProps<{
  carModel: string
}>()

const emit = defineEmits<{
  (e: 'submit', data: Omit<FormData, 'imagePreview' | 'image'> & { path: string }): void
}>()

const formData = reactive<FormData>({
  image: null as File | null,
  imagePreview: null as string | null,
  side: 'front',
  x: 50,
  y: 50,
  description: ''
})

const carSides = [
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
  { value: 'left', label: 'Left Side' },
  { value: 'right', label: 'Right Side' }
]

const getSchematicPath = (side: string) => {
  // Handle the case where the car model is 'zow' but files are named 'zoe_'
  const model = props.carModel === 'zow' ? 'zoe' : props.carModel
  return `/car_line_drawings/${model}_${side}.png`
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    formData.image = file
    formData.imagePreview = URL.createObjectURL(file)
  }
}

const submitForm = () => {
  if (!formData.image) return
  
  const data = {
    ...formData,
    path: URL.createObjectURL(formData.image),
    file: formData.image
  }
  
  emit('submit', data)
}
</script>

<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Add New Damage Entry</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="submitForm">
              <!-- Image Upload -->
              <div class="mb-4">
                <label for="damageImage" class="form-label">Damage Image</label>
                <input 
                  type="file" 
                  class="form-control" 
                  id="damageImage" 
                  accept="image/*" 
                  @change="handleImageUpload"
                  required
                >
                <div v-if="formData.imagePreview" class="mt-3">
                  <img :src="formData.imagePreview" class="img-thumbnail" style="max-height: 200px;">
                </div>
              </div>

              <!-- Side Selection with Schematic Preview -->
              <div class="row mb-4">
                <div class="col-md-6">
                  <label class="form-label">Car Side</label>
                  <select v-model="formData.side" class="form-select">
                    <option v-for="side in carSides" :key="side.value" :value="side.value">
                      {{ side.label }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <div class="schematic-preview position-relative" style="min-height: 200px; background-color: #f8f9fa;">
                    <NuxtImg 
                      :src="getSchematicPath(formData.side)" 
                      class="img-fluid" 
                      alt="Car side schematic"
                      loading="lazy"
                      format="webp"
                      quality="80"
                      sizes="sm:100vw md:80vw lg:600px"
                      style="max-height: 200px;"
                    />
                    <div class="position-absolute" 
                         :style="{
                           left: `${formData.x}%`, 
                           top: `${formData.y}%`, 
                           transform: 'translate(-50%, -50%)',
                           pointerEvents: 'none'
                         }">
                      <div class="damage-marker bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" 
                           style="width: 24px; height: 24px; font-weight: bold;">X</div>
                    </div>
                  </div>
                </div>
              </div>


              <!-- X Position Slider -->
              <div class="mb-3">
                <label for="xPosition" class="form-label">X Position: {{ formData.x }}%</label>
                <input 
                  type="range" 
                  class="form-range" 
                  id="xPosition" 
                  min="0" 
                  max="100" 
                  v-model.number="formData.x"
                >
              </div>

              <!-- Y Position Slider -->
              <div class="mb-4">
                <label for="yPosition" class="form-label">Y Position: {{ formData.y }}%</label>
                <input 
                  type="range" 
                  class="form-range" 
                  id="yPosition" 
                  min="0" 
                  max="100" 
                  v-model.number="formData.y"
                >
              </div>


              <!-- Description -->
              <div class="mb-4">
                <label for="description" class="form-label">Description</label>
                <textarea 
                  class="form-control" 
                  id="description" 
                  rows="3"
                  v-model="formData.description"
                  required
                ></textarea>
              </div>


              <button type="submit" class="btn btn-primary">Save Damage Entry</button>
            </form>
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
  height: 150px;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  overflow: hidden;
  background-color: #f8f9fa;
  display: flex;
  justify-content: center;
  align-items: center;
}

.damage-marker {
  position: absolute;
  color: red;
  font-weight: bold;
  font-size: 1.5rem;
  text-shadow: 0 0 3px white, 0 0 3px white, 0 0 3px white, 0 0 3px white;
  pointer-events: none;
}
</style>
