<script setup lang="ts">
const route = useRoute()
const carId = route.params.carId as string
navigateTo(`/cars/${carId}/damages`, { redirectCode: 301 })
</script>

<template>
  <div></div>
</template>
