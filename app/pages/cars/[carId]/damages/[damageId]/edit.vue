<script setup lang="ts">
import type { CarSide, DamageDetail, Damage } from '~~/shared/types'
import { ref as storageRef, getDownloadURL } from 'firebase/storage'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const carId = route.params.carId as string
const damageId = route.params.damageId as string

const uploadStatus = ref<'idle' | 'success' | 'error'>('idle')
const selectedImage = ref<{ url: string; fullPath: string; name: string } | null>(null)
const damageDescription = ref('')
const selectedSide = ref<CarSide | null>('left')
const damageX = ref(50)
const damageY = ref(50)
const extraDetails = ref<Array<{ image: { url: string; fullPath: string; name: string } | null; description: string }>>([])
const submitting = ref(false)
const loading = ref(true)

const { data: damageData, status: damageStatus, error: damageError } = await useFetch(`/api/cars/${carId}/damages/${damageId}`, {
  key: `damage-${damageId}`,
})

// Load damage data into form
onMounted(async () => {
  if (damageData.value) {
    const data = damageData.value as any
    
    damageDescription.value = data.description || ''
    selectedSide.value = data.side || 'left'
    damageX.value = data.x || 50
    damageY.value = data.y || 50

    // Load main image
    if (data.imagePath) {
      try {
        const storage = useFirebaseStorage()
        const imageStorageRef = storageRef(storage, data.imagePath)
        const imageUrl = await getDownloadURL(imageStorageRef)
        selectedImage.value = {
          name: data.imagePath.split('/').pop() || '',
          url: imageUrl,
          fullPath: data.imagePath,
        }
      } catch (error) {
        console.error('Error loading main image:', error)
      }
    }

    // Load extra details
    if (data.details && data.details.length > 1) {
      const storage = useFirebaseStorage()
      const detailsPromises = data.details.slice(1).map(async (detail: DamageDetail) => {
        if (detail.imagePath) {
          try {
            const detailStorageRef = storageRef(storage, detail.imagePath)
            const detailUrl = await getDownloadURL(detailStorageRef)
            return {
              image: {
                name: detail.imagePath.split('/').pop() || '',
                url: detailUrl,
                fullPath: detail.imagePath,
              },
              description: detail.description || '',
            }
          } catch (error) {
            console.error('Error loading detail image:', error)
            return {
              image: null,
              description: detail.description || '',
            }
          }
        }
        return {
          image: null,
          description: detail.description || '',
        }
      })
      
      extraDetails.value = await Promise.all(detailsPromises)
    }
  }
  loading.value = false
})

const isFormValid = computed(() => {
  return (
    selectedImage.value &&
    damageDescription.value.trim() !== '' &&
    selectedSide.value
  )
})

async function updateDamage() {
  if (!isFormValid.value) return
  
  try {
    submitting.value = true
    
    const allDetails: DamageDetail[] = [
      {
        description: damageDescription.value || 'Schaden bearbeitet',
        imagePath: selectedImage.value?.fullPath || '',
      },
      ...extraDetails.value
        .filter(d => d.image)
        .map(d => ({
          description: d.description || '',
          imagePath: d.image!.fullPath,
        })),
    ]

    const damageUpdate = {
      description: damageDescription.value || 'Schaden bearbeitet',
      imagePath: selectedImage.value?.fullPath || '',
      details: allDetails,
      side: selectedSide.value || 'front',
      x: damageX.value,
      y: damageY.value,
    }

    const { authHeaders } = useAuthHeaders()
    await $fetch(`/api/cars/${carId}/damages/${damageId}`, {
      method: 'PATCH',
      body: damageUpdate,
      headers: authHeaders.value,
    })

    uploadStatus.value = 'success'
    setTimeout(() => {
      navigateTo(`/cars/${carId}/damages?t=${Date.now()}`)
    }, 1500)
  } catch (error) {
    console.error('Error updating damage:', error)
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

    <div v-if="damageStatus === 'pending' || loading" class="text-center py-8">
      <p class="text-gray-600">Lade Schadensdaten...</p>
    </div>

    <div v-else-if="damageError || !damageData" class="text-center py-8">
      <UAlert
        color="red"
        variant="solid"
        title="Fehler"
        description="Schaden nicht gefunden."
      />
      <UButton
        variant="outline"
        class="mt-4"
        @click="navigateTo(`/cars/${carId}/damages`)"
      >
        Zurück zur Übersicht
      </UButton>
    </div>

    <div v-else class="max-w-4xl mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Schaden bearbeiten</h1>

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
        />
      </div>

      <DamageDetailsForm
        v-model="extraDetails"
        :car-id="carId"
        :main-image="selectedImage"
        :main-description="damageDescription"
        :disabled="!(selectedImage && selectedSide && damageDescription)"
      />

      <div class="flex gap-3">
        <UButton
          variant="outline"
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
          @click="updateDamage"
        >
          Änderungen speichern
        </UButton>
      </div>

      <UAlert
        v-if="uploadStatus === 'success'"
        color="green"
        variant="solid"
        class="mt-4"
        title="Erfolg"
        description="Schaden erfolgreich aktualisiert! Weiterleitung..."
      />
      <UAlert
        v-if="uploadStatus === 'error'"
        color="red"
        variant="solid"
        class="mt-4"
        title="Fehler"
        description="Fehler beim Aktualisieren. Bitte versuche es erneut."
      />
    </div>
  </div>
</template>
