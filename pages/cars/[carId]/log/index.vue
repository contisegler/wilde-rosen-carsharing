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
      <LucidePlus class="w-4 h-4 mr-2" />
      Neuer Eintrag
    </Button>
    <CarLogViewer :car-id="carId" />
  </DefaultPageStructure>
</template>
