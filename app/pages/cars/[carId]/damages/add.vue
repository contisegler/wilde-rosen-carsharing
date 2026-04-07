<script setup lang="ts">
import type { CarSide, DamageDetail } from '~~/shared/types'
import type { StorageFile } from '~/composables/useFirebaseStorageUpload'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const carId = route.params.carId as string

const uploadStatus = ref<'idle' | 'success' | 'error'>('idle')
const selectedImage = ref<File | StorageFile | null>(null)
const damageDescription = ref('')
const selectedSide = ref<CarSide | null>('left')
const damageX = ref(50)
const damageY = ref(50)
const extraDetails = ref<Array<{ image: File | StorageFile | null; description: string }>>([])
const submitting = ref(false)
const { uploadFile } = useFirebaseStorageUpload(`cars/${carId}/damages`)

const isFormValid = computed(() => {
  return (
    selectedImage.value &&
    damageDescription.value.trim() !== '' &&
    selectedSide.value
  )
})

async function submitDamage() {
  if (!isFormValid.value) return
  
  try {
    submitting.value = true
    
    // Upload main image if it's a File
    let mainImagePath = ''
    if (selectedImage.value instanceof File) {
      const uploaded = await uploadFile(selectedImage.value)
      if (!uploaded) {
        uploadStatus.value = 'error'
        return
      }
      mainImagePath = uploaded.fullPath
    } else if (selectedImage.value && 'fullPath' in selectedImage.value) {
      mainImagePath = selectedImage.value.fullPath
    }
    
    // Upload detail images if they are Files
    const uploadedDetails: DamageDetail[] = []
    for (const detail of extraDetails.value) {
      if (!detail.image) continue
      
      let imagePath = ''
      if (detail.image instanceof File) {
        const uploaded = await uploadFile(detail.image)
        if (!uploaded) continue
        imagePath = uploaded.fullPath
      } else if ('fullPath' in detail.image) {
        imagePath = detail.image.fullPath
      }
      
      if (imagePath) {
        uploadedDetails.push({
          description: detail.description || '',
          imagePath,
        })
      }
    }
    
    const allDetails: DamageDetail[] = [
      {
        description: damageDescription.value || 'Neuer Schaden gemeldet',
        imagePath: mainImagePath,
      },
      ...uploadedDetails,
    ]

    const damageData = {
      description: damageDescription.value || 'Neuer Schaden gemeldet',
      imagePath: mainImagePath,
      details: allDetails,
      side: selectedSide.value || 'front',
      x: damageX.value,
      y: damageY.value,
    }

    const { authHeaders } = useAuthHeaders()
    await $fetch(`/api/cars/${carId}/damages`, {
      method: 'POST',
      body: damageData,
      headers: authHeaders.value,
    })

    uploadStatus.value = 'success'
    setTimeout(() => {
      navigateTo(`/cars/${carId}/damages`)
    }, 1500)
  } catch (error) {
    console.error('Error submitting damage:', error)
    uploadStatus.value = 'error'
    setTimeout(() => (uploadStatus.value = 'idle'), 3000)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <CarPageNavigation :car-id="carId" current-view="damages" />

    <div class="max-w-4xl mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Neuen Schaden melden</h1>

      <DamageImageUpload
        v-model="selectedImage"
        :car-id="carId"
        @upload-error="uploadStatus = 'error'"
      />

      <DamageSideSelector
        v-model="selectedSide"
        :car-id="carId"
        :damage-x="damageX"
        :damage-y="damageY"
        :disabled="!selectedImage"
        @update:damage-x="damageX = $event"
        @update:damage-y="damageY = $event"
      />

      <div class="mb-4">
        <label for="description" class="block text-left font-medium text-gray-700 mb-2">
          Schadensbeschreibung:
        </label>
        <UTextarea
          id="description"
          v-model="damageDescription"
          :disabled="!selectedImage"
          :rows="3"
          placeholder="Beschreiben Sie den Schaden..."
          class="w-full"
        />
      </div>

      <DamageDetailsForm
        v-model="extraDetails"
        :car-id="carId"
        :main-image="selectedImage"
        :main-description="damageDescription"
        :disabled="!(selectedImage && selectedSide && damageDescription)"
      />

      <div class="flex gap-2">
        <UButton
          variant="outline"
          size="lg"
          class="flex-1"
          @click="navigateTo(`/cars/${carId}/damages`)"
        >
          Abbrechen
        </UButton>
        <UButton
          color="primary"
          size="lg"
          class="flex-1"
          :disabled="!isFormValid || submitting"
          :loading="submitting"
          @click="submitDamage"
        >
          Schaden melden
        </UButton>
      </div>

      <UAlert
        v-if="uploadStatus === 'success'"
        color="success"
        variant="solid"
        class="mt-4"
        title="Erfolg"
        description="Schaden erfolgreich gemeldet! Weiterleitung..."
      />
      <UAlert
        v-if="uploadStatus === 'error'"
        color="error"
        variant="solid"
        class="mt-4"
        title="Fehler"
        description="Fehler beim Melden. Bitte versuche es erneut."
      />
    </div>
  </div>
</template>
