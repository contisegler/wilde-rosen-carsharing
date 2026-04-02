<script setup lang="ts">
const route = useRoute()
const carId = route.params.carId as string

const { data: logData, status: logStatus, error: logError } = useFetch(`/api/cars/${carId}/log`, {
  key: `log-${carId}`
})

const { data: car, status: carStatus, error: carError } = useFetch(`/api/cars/${carId}`, {
  key: `cars-${carId}`
})
</script>

<template>
  <div>
    <CarPageNavigation :car-id="carId" current-view="log" />
    
    <h2 class="text-xl font-bold mb-4">Fahrtenbuch für {{ car?.title }}</h2>
    <div v-if="logStatus === 'pending'">Loading...</div>
    <div v-else-if="logError">Error: {{ logError }}</div>
    <pre v-else class="bg-gray-100 p-4 rounded overflow-auto">{{ logData }}</pre>
  </div>
</template>
