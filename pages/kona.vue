<script setup lang="ts">
// Page for displaying Kona damage images with schematics

// Define image paths
const konaDamageImages = ref<DamageEntry[]>([])
</script>

<template>
  <div>
    <div class="d-flex align-items-center mb-4 position-relative">
      <NuxtLink to="/" class="btn btn-outline-secondary position-absolute start-0">Zurück</NuxtLink>
      <h1 class="w-100 text-center">Kona Schäden</h1>
    </div>

    <CarDamageViewer 
      :damage-images="konaDamageImages" 
      car-model="kona"
      title="" 
    />
  </div>
</template>
