<script setup lang="ts">
  import { collection, addDoc } from "firebase/firestore"

  definePageMeta({
    middleware: "auth",
  })

  const uploadStatus = ref("")
  const selectedCar = ref("zoe")
  const selectedImage = ref<CloudImage | null>(null)
  const damageDescription = ref("")
  const selectedSide = ref<CarSide | null>("left")
  const damageX = ref(50)
  const damageY = ref(50)
  const extraDetails = ref<DamageDetailFormEntry[]>([])

  const isFormValid = computed(() => {
    return (
      selectedImage.value &&
      damageDescription.value.trim() !== "" &&
      selectedSide.value
    )
  })

  async function uploadDamage() {
    try {
      const firestore = useFirestore()
      const user = await getCurrentUser()
      if (!user) {
        uploadStatus.value = "error"
        return
      }
      // Add a new damage entry to /cars/{carId}/damages using DamageEntry structure
      // Build details array: first entry is always the main image
      const allDetails: DamageDetail[] = [
        {
          description: damageDescription.value || "Neuer Schaden gemeldet",
          imagePath: selectedImage.value?.fullPath || "",
        },
        ...extraDetails.value
          .filter(d => d.image)
          .map(d => ({
            description: d.description || "",
            imagePath: d.image!.fullPath,
          })),
      ]

      const damageEntry: Partial<DamageEntry> = {
        description: damageDescription.value || "Neuer Schaden gemeldet",
        imagePath: selectedImage.value?.fullPath || "",
        details: allDetails,
        side: selectedSide.value || "front",
        x: damageX.value,
        y: damageY.value,
      }
      await addDoc(collection(firestore, `cars/${selectedCar.value}/damages`), {
        ...damageEntry,
        createdAt: new Date(),
      })
      uploadStatus.value = "success"
      setTimeout(() => (uploadStatus.value = ""), 5000)
      selectedImage.value = null
      damageDescription.value = ""
      extraDetails.value = []
      selectedSide.value = null
      damageX.value = 50
      damageY.value = 50
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      uploadStatus.value = "error"
      setTimeout(() => (uploadStatus.value = ""), 2000)
    }
  }
</script>

<template>
  <DefaultPageStructure>
    <template #title>Schaden melden</template>
    <label for="car" class="block text-left font-medium text-gray-700 mb-2">Auto auswählen:</label>
    <select
      id="car"
      v-model="selectedCar"
      class="w-full p-2 mb-4 border border-gray-300 rounded-md"
      @change="selectedImage = null"
    >
      <option value="zoe">Zoe</option>
      <option value="kona">Kona</option>
      <option value="kangoo">Kangoo</option>
    </select>

    <DamageImageUpload
      v-model="selectedImage"
      :car-id="selectedCar"
      @upload-error="uploadStatus = 'error'"
    />

    <DamageSideSelector
      v-model="selectedSide"
      :car-id="selectedCar"
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
      :car-id="selectedCar"
      :main-image="selectedImage"
      :main-description="damageDescription"
      :disabled="!(selectedImage && selectedSide && damageDescription)"
    />

    <Button
      variant="outline"
      size="lg"
      class="w-full font-bold"
      :disabled="!isFormValid"
      @click="uploadDamage"
    >
      Schaden melden
    </Button>
    <p v-if="uploadStatus === 'success'" class="text-green-500 mt-4">
      Schaden erfolgreich gemeldet! Möchtest du einen weiteren Schaden melden?
    </p>
    <p v-if="uploadStatus === 'error'" class="text-red-500 mt-4">
      Fehler beim Melden. Bist du angemeldet?
    </p>
  </DefaultPageStructure>
</template>
