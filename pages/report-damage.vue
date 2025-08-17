<script setup lang="ts">
  import { collection, addDoc } from "firebase/firestore"

  definePageMeta({
    middleware: "auth",
  })

  const uploadStatus = ref("")
  const selectedCar = ref("zoe")
  interface CloudImage {
    name: string
    url: string
    fullPath: string
    size?: number
    timeCreated?: string
  }

  const selectedImage = ref<CloudImage | null>(null)
  const damageDescription = ref("")
  const selectedSide = ref<CarSide | null>(null)
  const damageOrder = ref<number | null>(null)

  const isFormValid = computed(() => {
    return selectedImage.value && damageDescription.value.trim() !== "" && selectedSide.value && damageOrder.value
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
      const damageEntry: Partial<DamageEntry> = {
        description: damageDescription.value || "Neuer Schaden gemeldet",
        imagePath: selectedImage.value?.fullPath || "",
        details: [
          {
            description: "Detail Beschreibung vom schaden.",
            imagePath: selectedImage.value?.fullPath || "",
          },
        ],
        order: damageOrder.value || 99,
        side: selectedSide.value || "front",
        x: 0,
        y: 0,
      }

      await addDoc(collection(firestore, `cars/${selectedCar.value}/damages`), {
        ...damageEntry,
        createdAt: new Date(),
      })
      uploadStatus.value = "success"
      setTimeout(() => (uploadStatus.value = ""), 2000)
      selectedImage.value = null
      damageDescription.value = ""
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

    <div class="mb-4">
      <label class="block text-left font-medium text-gray-700 mb-2">Schadensbild:</label>
      <CloudImageSelector
        :storage-path="`cars/${selectedCar}/damages`"
        :multiple="false"
        :allow-upload="true"
        :allow-browse="true"
        @image-selected="selectedImage = $event"
        @upload-error="uploadStatus = 'error'"
      />

      <!-- Large Preview for Selected Image -->
      <div v-if="selectedImage" class="mt-4">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Ausgewähltes Bild:</h4>
        <div class="relative min-h-[30px]">
          <FirebaseNuxtImg
            :src="selectedImage.url"
            :alt="selectedImage.name"
            class="w-full max-w-full h-auto max-h-[600px] object-contain cursor-pointer transition-all duration-300 group-hover:brightness-90"
            sizes="sm:80vw md:70vw lg:736px"
            format="webp"
            :quality="70"
            loading="lazy"
            fit="inside"
            placeholder
          />
          <div
            class="absolute bottom-0 left-0 right-0 p-2 bg-black/80 text-white opacity-50 text-sm md:text-base text-center"
          >
            <div class="truncate font-medium">{{ selectedImage.name }}</div>
          </div>
          <!-- <div class="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-sm p-2">
              <div class="truncate font-medium">{{ selectedImage.name }}</div>
            </div> -->
          <Button
            variant="destructive"
            size="sm"
            class="absolute top-2 right-2"
            @click="selectedImage = null"
          >
            <LucideX class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>

    <div :class="{ 'opacity-50': !selectedImage }">
      <label for="side" class="block text-left font-medium text-gray-700 mb-2">
        Fahrzeugseite:
      </label>
      <select
        id="side"
        v-model="selectedSide"
        class="w-full p-2 mb-4 border border-gray-300 rounded-md"
        :disabled="!selectedImage"
      >
        <option value="front">Vorne</option>
        <option value="back">Hinten</option>
        <option value="left">Links</option>
        <option value="right">Rechts</option>
        <option value="top">Oben</option>
      </select>

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

      <label for="order" class="block text-left font-medium text-gray-700 mb-2">
        Reihenfolge:
      </label>
      <input
        id="order"
        v-model.number="damageOrder"
        type="number"
        step="0.1"
        min="0"
        class="w-full p-2 mb-4 border border-gray-300 rounded-md"
        :disabled="!selectedImage"
        placeholder="1.0"
      />
    </div>

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
      Schaden erfolgreich gemeldet!
    </p>
    <p v-if="uploadStatus === 'error'" class="text-red-500 mt-4">
      Fehler beim Melden. Sind Sie angemeldet?
    </p>
  </DefaultPageStructure>
</template>

<style scoped></style>
