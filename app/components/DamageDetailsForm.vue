<script setup lang="ts">
import type { StorageFile } from '~/composables/useFirebaseStorageUpload'

export interface DamageDetailFormEntry {
  image: File | StorageFile | null
  description: string
}

interface Props {
  carId: string
  mainImage: File | StorageFile | null
  mainDescription: string
  modelValue: DamageDetailFormEntry[]
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: DamageDetailFormEntry[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const extraDetails = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const uploadingIndex = ref<number | null>(null)

function addDetail() {
  extraDetails.value = [...extraDetails.value, { image: null, description: '' }]
}

function removeDetail(index: number) {
  const newDetails = [...extraDetails.value]
  newDetails.splice(index, 1)
  extraDetails.value = newDetails
}

function updateDetailDescription(index: number, description: string) {
  const newDetails = [...extraDetails.value]
  if (newDetails[index]) {
    newDetails[index].description = description
    extraDetails.value = newDetails
  }
}

function handleDetailImageSelect(index: number, file: File | null | undefined) {
  if (!file) return
  
  const newDetails = [...extraDetails.value]
  if (newDetails[index]) {
    newDetails[index].image = file
    extraDetails.value = newDetails
  }
}

function removeDetailImage(index: number) {
  const newDetails = [...extraDetails.value]
  if (newDetails[index]) {
    newDetails[index].image = null
    extraDetails.value = newDetails
  }
}

function getImageUrl(image: File | StorageFile | null): string | null {
  if (!image) return null
  if (image instanceof File) {
    return URL.createObjectURL(image)
  }
  return image.url
}

function getImageName(image: File | StorageFile | null): string {
  if (!image) return ''
  return image.name
}
</script>

<template>
  <div class="mb-6 transition-opacity" :class="{ 'opacity-50 pointer-events-none': disabled }">
    <h3 class="text-left font-medium text-gray-700 mb-3">Schadensdetails</h3>

    <div class="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
      <div class="flex items-center gap-2 mb-2">
        <UBadge color="neutral" variant="solid">1</UBadge>
        <span class="text-sm font-medium text-gray-600">Übersichtsbild (automatisch)</span>
      </div>
      <div class="flex gap-3 items-start">
        <div class="w-20 h-20 shrink-0 overflow-hidden rounded">
          <img
            v-if="mainImage && getImageUrl(mainImage)"
            :src="getImageUrl(mainImage)!"
            :alt="getImageName(mainImage)"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
            <UIcon name="i-lucide-image" class="w-6 h-6 text-gray-400" />
          </div>
        </div>
        <div class="text-sm text-gray-500 pt-1">
          {{ mainDescription || '—' }}
        </div>
      </div>
    </div>

    <div
      v-for="(detail, index) in extraDetails"
      :key="index"
      class="mb-4 p-3 border border-gray-200 rounded-md"
    >
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <UBadge color="neutral" variant="outline">{{ index + 2 }}</UBadge>
          <span class="text-sm font-medium text-gray-700">Zusätzliches Detail</span>
        </div>
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="sm"
          @click="removeDetail(index)"
        />
      </div>

      <div class="mb-2">
        <label class="block text-left text-sm text-gray-600 mb-1">Detailbild:</label>
        <div v-if="detail.image" class="flex gap-3 items-start">
          <div class="relative w-20 h-20 shrink-0 overflow-hidden rounded">
            <img
              :src="getImageUrl(detail.image)!"
              :alt="getImageName(detail.image)"
              class="w-full h-full object-cover"
            />
            <UButton
              icon="i-lucide-x"
              color="error"
              variant="solid"
              size="xs"
              class="absolute top-0 right-0"
              @click="removeDetailImage(index)"
            />
          </div>
          <span class="text-xs text-gray-500 pt-1 truncate">{{ getImageName(detail.image) }}</span>
        </div>
        <div v-else>
          <UFileUpload
            :model-value="null"
            accept="image/*"
            variant="button"
            @update:model-value="handleDetailImageSelect(index, $event)"
          >
            <template #default>
              <UButton icon="i-lucide-upload">
                Bild hochladen
              </UButton>
            </template>
          </UFileUpload>
        </div>
      </div>

      <div>
        <label class="block text-left text-sm text-gray-600 mb-1">Beschreibung:</label>
        <UTextarea
          :model-value="detail.description"
          placeholder="Detail beschreiben..."
          :rows="2"
          @update:model-value="updateDetailDescription(index, $event)"
        />
      </div>
    </div>

    <UButton
      icon="i-lucide-plus"
      variant="outline"
      block
      @click="addDetail"
    >
      Weiteres Detail hinzufügen
    </UButton>
  </div>
</template>
