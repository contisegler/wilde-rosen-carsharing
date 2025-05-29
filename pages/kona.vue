<script setup lang="ts">
// Page for displaying Kona damage images with schematics

// Define image paths
const konaDamageImages = ref<DamageEntry[]>([])
</script>

<template>
  <div>
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <NuxtLink to="/" class="btn btn-outline-secondary">Zurück zur Startseite</NuxtLink>
        <h1>Kona Schäden</h1>
        <div style="width: 120px"></div> <!-- Spacer to balance the layout -->
      </div>

      <CarDamageViewer 
        :damage-images="konaDamageImages" 
        car-model="kona"
        title="" 
      />
    </div>
  </div>
</template>
