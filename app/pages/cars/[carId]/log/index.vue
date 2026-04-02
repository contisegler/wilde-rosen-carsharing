<script setup lang="ts">
const route = useRoute()
const carId = route.params.carId as string
</script>

<template>
  <div>
    <CarPageNavigation :car-id="carId" current-view="log" />
    <LogViewer :car-id="carId" />
  </div>
</template>
