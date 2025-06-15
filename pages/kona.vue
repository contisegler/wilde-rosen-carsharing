<script setup lang="ts">
// Page for displaying Kona damage images with schematics

// Define image paths
const konaDamageImages = ref<DamageEntry[]>([])
</script>

<template>
  <div>
    <CarDamageViewer 
      :damage-images="konaDamageImages" 
      car-model="kona"
      title="Kona"
    />
  </div>
</template>
