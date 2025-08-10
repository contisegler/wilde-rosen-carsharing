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

  const selectedImages = ref<CloudImage[]>([])
  const damageDescription = ref("")

  async function uploadDamage() {
    try {
      const firestore = useFirestore()
      const user = await getCurrentUser()
      if (!user) {
        uploadStatus.value = "error"
        return
      }
      // Add a new damage entry to /cars/{carId}/damages
      await addDoc(collection(firestore, `cars/${selectedCar.value}/damages`), {
        description: damageDescription.value || "Neuer Schaden gemeldet",
        createdAt: new Date(),
        userId: user.uid,
        images: selectedImages.value.map(img => ({
          name: img.name,
          url: img.url,
          fullPath: img.fullPath
        }))
      })
      uploadStatus.value = "success"
      setTimeout(() => (uploadStatus.value = ""), 2000)
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
    <HalfWidth>
      <label for="car" class="block text-left font-medium text-gray-700 mb-2">
        Auto auswählen:
      </label>
      <select
        id="car"
        v-model="selectedCar"
        class="w-full p-2 mb-4 border border-gray-300 rounded-md"
      >
        <option value="zoe">Zoe</option>
        <option value="kona">Kona</option>
        <option value="kangoo">Kangoo</option>
      </select>

      <label for="description" class="block text-left font-medium text-gray-700 mb-2">
        Schadensbeschreibung:
      </label>
      <textarea
        id="description"
        v-model="damageDescription"
        class="w-full p-2 mb-4 border border-gray-300 rounded-md"
        rows="3"
        placeholder="Beschreiben Sie den Schaden..."
      ></textarea>

      <div class="mb-4">
        <label class="block text-left font-medium text-gray-700 mb-2">
          Schadenbilder:
        </label>
        <CloudImageSelector
          :storage-path="`cars/${selectedCar}/damages`"
          :multiple="true"
          :allow-upload="true"
          :allow-browse="true"
          @images-selected="selectedImages = $event"
          @upload-error="uploadStatus = 'error'"
        />
      </div>
      <Button variant="outline" size="lg" class="w-full font-bold" @click="uploadDamage">
        Schaden melden
      </Button>
      <p v-if="uploadStatus === 'success'" class="text-green-500 mt-4">
        Schaden erfolgreich gemeldet!
      </p>
      <p v-if="uploadStatus === 'error'" class="text-red-500 mt-4">
        Fehler beim Melden. Sind Sie angemeldet?
      </p>
    </HalfWidth>
  </DefaultPageStructure>
</template>

<style scoped></style>
