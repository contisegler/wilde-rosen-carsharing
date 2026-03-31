<script setup lang="ts">
const route = useRoute()
const carId = route.params.carId as string
</script>

<template>
  <DefaultPageStructure>
    <CarPageNavigation :car-id="carId" current-view="damages" :show-report-button="true" />
    <CarViewer :car-id="carId" />
  </DefaultPageStructure>
</template>
