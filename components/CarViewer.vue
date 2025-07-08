<script setup lang="ts">
  // Component for displaying damage images with schematics
  interface Props {
    carId: string
  }

  const props = defineProps<Props>()

  const { car, damageEntries, isLoading, error } = useCarDamages({
    carId: props.carId,
  })

  // Log any errors
  if (error.value) {
    console.error("Error loading car data:", error.value)
  }
</script>

<template>
  <div>
    <div class="flex items-center mb-4 relative">
      <NuxtLink to="/" class="absolute left-0">
        <Button variant="outline">Zurück</Button>
      </NuxtLink>
      <h2 class="w-full text-center text-lg sm:text-xl md:text-2xl font-bold">
        {{ car?.title || carId }}
      </h2>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center p-8">
      <p>Lade Schadensdaten...</p>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <strong class="font-bold">Fehler!</strong>
      <span class="block sm:inline">Die Schadensdaten konnten nicht geladen werden.</span>
    </div>

    <!-- Error state -->
    <div
      v-else-if="!car"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <strong class="font-bold">Fehler!</strong>
      <span class="block sm:inline">
        Das Auto mit der Id {{ carId }} konnte nicht gefunden werden.
      </span>
    </div>

    <!-- Empty state -->
    <div v-else-if="!damageEntries?.length" class="text-center p-8">
      <p>Keine Schäden gefunden.</p>
    </div>

    <div v-else class="flex flex-wrap w-full">
      <div class="w-full mx-auto">
        <!-- All Damage Images -->
        <div v-for="damageEntry in damageEntries" :key="damageEntry.path" class="mb-2">
          <CarDamageImage :damage-entry="damageEntry" :car-id="carId" />
        </div>
      </div>
    </div>
  </div>
</template>
