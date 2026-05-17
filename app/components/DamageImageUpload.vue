<script setup lang="ts">
import { ref as storageRef, getDownloadURL } from 'firebase/storage'
import type { StorageFile } from '~~/shared/types'

interface Props {
  carId: string
  modelValue: File | StorageFile | null
}

interface Emits {
  (e: 'update:modelValue', value: File | StorageFile | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedImage = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const { listFiles } = useFirebaseStorageUpload(`cars/${props.carId}/damages`)
const activeTab = ref('upload')
const isLoadingImages = ref(false)
const availableImages = ref<StorageFile[]>([])
const uploadedFile = ref<File | null>(null)
const displayUrl = ref<string | null>(null)

// Load display URL when image changes
watch(() => props.modelValue, async (newValue) => {
  if (!newValue) {
    displayUrl.value = null
    return
  }
  
  if (import.meta.client) {
    // If it's a File object, create object URL
    if (newValue instanceof File) {
      displayUrl.value = URL.createObjectURL(newValue)
    }
    // If it's a StorageFile, load from Firebase
    else if ('fullPath' in newValue) {
      try {
        const storage = useFirebaseStorage()
        const fileRef = storageRef(storage, newValue.fullPath)
        displayUrl.value = await getDownloadURL(fileRef)
      } catch (error) {
        console.error('Error loading image URL:', error)
        displayUrl.value = newValue.url
      }
    }
  }
}, { immediate: true })

// Load available images when browse tab is opened
watch(activeTab, async (newTab) => {
  if (newTab === 'browse' && availableImages.value.length === 0) {
    await loadAvailableImages()
  }
})

async function loadAvailableImages() {
  try {
    isLoadingImages.value = true
    const files = await listFiles()
    console.log('Loaded available images:', files.length, files)
    availableImages.value = files
  } finally {
    isLoadingImages.value = false
  }
}

function selectImageFromBrowser(image: StorageFile) {
  selectedImage.value = image
  activeTab.value = 'upload'
}

function removeImage() {
  selectedImage.value = null
  uploadedFile.value = null
  displayUrl.value = null
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return ''
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Byte'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
}

function formatDate(dateString?: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('de-DE')
}

function getImageName(image: File | StorageFile | null): string {
  if (!image) return ''
  if (image instanceof File) return image.name
  return image.name
}

function isFile(image: File | StorageFile | null): boolean {
  return image instanceof File
}
</script>

<template>
  <div class="mb-4">
    <label class="block text-left font-medium text-gray-700 mb-2">Schadensbild:</label>
    
    <div v-if="!selectedImage">
      <UTabs
        v-model="activeTab"
        :items="[
          { label: 'Neues Bild hochladen', value: 'upload', icon: 'i-lucide-upload' },
          { label: 'Vorhandenes Bild wählen', value: 'browse', icon: 'i-lucide-images' }
        ]"
        class="mb-4"
      />

      <!-- Upload Tab -->
      <div v-if="activeTab === 'upload'">
        <UFileUpload
          v-model="uploadedFile"
          accept="image/*"
          label="Bild hier ablegen oder klicken zum Auswählen"
          description="PNG, JPG, GIF oder WEBP (max. 10MB)"
          icon="i-lucide-image"
          class="w-full"
          :ui="{ base: 'min-h-48' }"
          @update:model-value="selectedImage = $event || null"
        />
      </div>

      <!-- Browse Tab -->
      <div v-else-if="activeTab === 'browse'">
        <div v-if="isLoadingImages" class="text-center py-12">
          <div class="flex justify-center">
            <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
          </div>
          <p class="mt-2 text-gray-600">Bilder werden geladen...</p>
        </div>

        <div v-else-if="availableImages.length === 0" class="text-center py-12">
          <UIcon name="i-lucide-image-off" class="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p class="text-gray-600 font-medium">Keine Bilder gefunden</p>
          <p class="text-sm text-gray-500 mt-1">Wechseln Sie zum Tab "Neues Bild hochladen", um ein Bild hinzuzufügen.</p>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="image in availableImages"
            :key="image.fullPath"
            class="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-500 transition-all"
            @click="selectImageFromBrowser(image)"
          >
            <FirebaseNuxtImg
              :src="image.url"
              :alt="image.name"
              class="w-full h-32 object-cover"
              sizes="sm:150px md:200px"
              :quality="80"
              loading="lazy"
            />

            <!-- Image Info -->
            <div class="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2">
              <div class="truncate font-medium">{{ image.name }}</div>
              <div class="flex justify-between text-gray-300">
                <span>{{ formatFileSize(image.size) }}</span>
                <span>{{ formatDate(image.timeCreated) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Image Preview -->
    <div v-else class="mt-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Ausgewähltes Bild:</h4>
      <div class="relative rounded-lg overflow-hidden">
        <img
          v-if="displayUrl"
          :src="displayUrl"
          :alt="getImageName(selectedImage)"
          class="w-full max-w-full h-auto max-h-[600px] object-cover"
        />
        <div
          class="absolute bottom-0 left-0 right-0 p-2 bg-black/80 text-white text-sm md:text-base text-center"
        >
          <div class="truncate font-medium">{{ getImageName(selectedImage) }}</div>
          <div v-if="isFile(selectedImage)" class="text-xs text-gray-300">
            Wird beim Absenden hochgeladen
          </div>
        </div>
        <UButton
          icon="i-lucide-x"
          color="error"
          variant="solid"
          class="absolute top-2 right-2"
          @click="removeImage"
        />
      </div>
    </div>
  </div>
</template>
