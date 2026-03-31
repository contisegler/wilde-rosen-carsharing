<script setup lang="ts">
const route = useRoute()
const carId = route.params.carId as string

function cancel() {
  navigateTo(`/cars/${carId}/log`)
}

function submit() {
  // TODO: Implement log entry submission
  console.log('Submit log entry for', carId)
  navigateTo(`/cars/${carId}/log`)
}
</script>

<template>
  <DefaultPageStructure>
    <CarPageNavigation :car-id="carId" current-view="log" :disabled="true" />

    <div class="text-center py-12">
      <h2 class="text-2xl font-bold mb-4">Coming Soon</h2>
      <p class="text-gray-600 mb-8">
        Die Funktion zum Hinzufügen von Fahrtenbuch-Einträgen wird bald verfügbar sein.
      </p>
    </div>

    <div class="flex gap-2">
      <Button
        variant="outline"
        size="lg"
        class="flex-1"
        @click="cancel"
      >
        Abbrechen
      </Button>
      <Button
        variant="default"
        size="lg"
        class="flex-1 font-bold"
        disabled
        @click="submit"
      >
        Eintragen
      </Button>
    </div>
  </DefaultPageStructure>
</template>
