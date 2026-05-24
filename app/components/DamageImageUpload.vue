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

function removeImage() {
  selectedImage.value = null
  displayUrl.value = null
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
      <ImageSelector
        :storage-path="`cars/${props.carId}/damages`"
        @select="selectedImage = $event"
      />
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
