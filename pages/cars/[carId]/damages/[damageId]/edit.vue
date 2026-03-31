<script setup lang="ts">
import { doc, updateDoc } from "firebase/firestore"
import { ref as storageRef } from "firebase/storage"

definePageMeta({
  middleware: "auth",
})

const route = useRoute()
const carId = route.params.carId as string
const damageId = route.params.damageId as string

const uploadStatus = ref("")
const selectedImage = ref<CloudImage | null>(null)
const damageDescription = ref("")
const selectedSide = ref<CarSide | null>("left")
const damageX = ref(50)
const damageY = ref(50)
const extraDetails = ref<DamageDetailFormEntry[]>([])

const firestore = useFirestore()
const storage = useFirebaseStorage()
const damageDocRef = doc(firestore, `cars/${carId}/damages/${damageId}`)
const { data: damageData, pending } = useDocument<DamageEntry>(damageDocRef)

watch(
  damageData,
  newData => {
    if (newData) {
      damageDescription.value = newData.description || ""
      selectedSide.value = newData.side || "left"
      damageX.value = newData.x || 50
      damageY.value = newData.y || 50

      if (newData.imagePath) {
        const imageStorageRef = storageRef(storage, newData.imagePath)
        const imageUrl = useStorageFileUrl(imageStorageRef).url.value
        selectedImage.value = {
          name: newData.imagePath.split("/").pop() || "",
          url: imageUrl || "",
          fullPath: newData.imagePath,
        }
      }

      if (newData.details && newData.details.length > 1) {
        extraDetails.value = newData.details.slice(1).map(detail => {
          if (detail.imagePath) {
            const detailStorageRef = storageRef(storage, detail.imagePath)
            const detailUrl = useStorageFileUrl(detailStorageRef).url.value
            return {
              image: {
                name: detail.imagePath.split("/").pop() || "",
                url: detailUrl || "",
                fullPath: detail.imagePath,
              },
              description: detail.description || "",
            }
          }
          return {
            image: null,
            description: detail.description || "",
          }
        })
      }
    }
  },
  { immediate: true },
)

const isFormValid = computed(() => {
  return selectedImage.value && damageDescription.value.trim() !== "" && selectedSide.value
})

async function updateDamage() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      uploadStatus.value = "error"
      return
    }

    const allDetails: DamageDetail[] = [
      {
        description: damageDescription.value || "Schaden bearbeitet",
        imagePath: selectedImage.value?.fullPath || "",
      },
      ...extraDetails.value
        .filter(d => d.image)
        .map(d => ({
          description: d.description || "",
          imagePath: d.image!.fullPath,
        })),
    ]

    const damageUpdate: Partial<DamageEntry> = {
      description: damageDescription.value || "Schaden bearbeitet",
      imagePath: selectedImage.value?.fullPath || "",
      details: allDetails,
      side: selectedSide.value || "front",
      x: damageX.value,
      y: damageY.value,
    }

    await updateDoc(damageDocRef, {
      ...damageUpdate,
      updatedAt: new Date(),
    })

    uploadStatus.value = "success"
    setTimeout(() => {
      navigateTo(`/cars/${carId}/damages?t=${Date.now()}`)
    }, 1500)
  } catch (error) {
    console.error("Error updating damage:", error)
    uploadStatus.value = "error"
    setTimeout(() => (uploadStatus.value = ""), 3000)
  }
}
</script>

<template>
  <DefaultPageStructure>
    <div v-if="pending" class="text-center py-8">
      <p class="text-gray-600">Lade Schadensdaten...</p>
    </div>

    <div v-else-if="!damageData" class="text-center py-8">
      <p class="text-red-600">Schaden nicht gefunden.</p>
      <Button variant="outline" class="mt-4" @click="navigateTo(`/cars/${carId}/damages`)">
        Zurück zur Übersicht
      </Button>
    </div>

    <div v-else>
      <CarPageNavigation :car-id="carId" current-view="damages" :disabled="true" />

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

      <label for="description" class="block text-left font-medium text-gray-700 mb-2">
        Schadensbeschreibung:
      </label>
      <textarea
        id="description"
        v-model="damageDescription"
        class="w-full p-2 mb-4 border border-gray-300 rounded-md"
        :disabled="!selectedImage"
        rows="3"
        placeholder="Beschreiben Sie den Schaden..."
      ></textarea>

      <DamageDetailsForm
        v-model="extraDetails"
        :car-id="carId"
        :main-image="selectedImage"
        :main-description="damageDescription"
        :disabled="!(selectedImage && selectedSide && damageDescription)"
      />

      <div class="flex gap-3">
        <Button variant="outline" class="flex-1" @click="navigateTo(`/cars/${carId}/damages`)">
          Abbrechen
        </Button>
        <Button
          variant="default"
          size="lg"
          class="flex-1 font-bold"
          :disabled="!isFormValid"
          @click="updateDamage"
        >
          Änderungen speichern
        </Button>
      </div>

      <p v-if="uploadStatus === 'success'" class="text-green-500 mt-4 text-center">
        Schaden erfolgreich aktualisiert! Weiterleitung...
      </p>
      <p v-if="uploadStatus === 'error'" class="text-red-500 mt-4 text-center">
        Fehler beim Aktualisieren. Bitte versuche es erneut.
      </p>
    </div>
  </DefaultPageStructure>
</template>
