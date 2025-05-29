<script setup lang="ts">
// Page for displaying Zoe damage images with schematics

// Define image paths
const zoeDamageImages = ref<DamageEntry[]>([])
</script>

<template>
  <div>
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <NuxtLink to="/" class="btn btn-outline-secondary">Back to Home</NuxtLink>
        <h1>Zoe Damage Inspection</h1>
        <div style="width: 120px"></div> <!-- Spacer to balance the layout -->
      </div>

      <CarDamageViewer 
        :damage-images="zoeDamageImages" 
        car-model="zoe"
        title="" 
      />
    </div>
  </div>
</template>
