<script setup lang="ts">
const route = useRoute()
const carId = route.params.carId as string

const { data: damages, status: damagesStatus, error: damagesError } = useFetch(`/api/cars/${carId}/damages`, {
  key: `damages-${carId}`
})


const { data: car, status: carStatus, error: carError } = useFetch(`/api/cars/${carId}`, {
  key: `cars-${carId}`
})
</script>

<template>
  <div>
    <h2 class="text-xl font-bold mb-4">Schäden am {{ car?.title }}</h2>
    <div v-if="damagesStatus === 'pending'">Loading...</div>
    <div v-else-if="damagesError">Error: {{ damagesError }}</div>
    <pre v-else class="bg-gray-100 p-4 rounded overflow-auto">{{ damages }}</pre>
  </div>
</template>
