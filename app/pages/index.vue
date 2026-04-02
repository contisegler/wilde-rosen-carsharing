<script setup lang="ts">
const user = useUser()

const { data: cars, status, error } = useFetch('/api/cars', {
  key: 'cars-list'
})
</script>

<template>
  <div class="flex flex-col gap-4 max-w-md mx-auto">
    <div class="mb-4 text-center text-gray-600">
      Willkommen! Wähle ein Auto, um Schäden oder das Fahrtenbuch anzusehen.
    </div>
    <div v-if="status === 'pending'">Loading cars...</div>
    <div v-else-if="error">Error loading cars: {{ error }}</div>
    <template v-else-if="cars">
      <NuxtLink v-for="car in cars" :key="car.id" :to="`/cars/${car.id}/damages`" class="w-full">
        <UButton 
          variant="outline" 
          class="w-full font-bold"
          color="neutral"
        >
          {{ car.title }}
        </UButton>
      </NuxtLink>
    </template>
  </div>
</template>
