<script setup lang="ts">
const route = useRoute()
const carId = route.params.carId as string

function addNewEntry() {
  navigateTo(`/cars/${carId}/log/add`)
}
</script>

<template>
  <DefaultPageStructure>
    <CarPageNavigation :car-id="carId" current-view="log" />
    <Button
      variant="default"
      size="lg"
      class="w-full font-bold mb-4"
      @click="addNewEntry"
    >
      <LucidePlay class="w-4 h-4 mr-2" />
      Fahrt starten
    </Button>
    <LogViewer :id="carId" type="car" />
  </DefaultPageStructure>
</template>
