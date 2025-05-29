<script setup lang="ts">
// Page for displaying Kangoo damage images with schematics

// Define image paths
const kangooDamageImages = ref<DamageEntry[]>([
  {
    "path": "/damages/kangoo/signal-2025-05-18-194106.jpeg",
    "side": "back",
    "x": 51,
    "y": 78,
    "description": "Kratzer an der Stoßstange hinten, bzw. der Laderampe zum Kofferraum."
  },
  {
    "path": "/damages/kangoo/signal-2025-05-18-194231.jpeg",
    "side": "left",
    "x": 13,
    "y": 61,
    "description": "Stoßstange steht vorne links ab."
  },
  {
    "path": "/damages/kangoo/signal-2025-05-18-194245.jpeg",
    "side": "right",
    "x": 79,
    "y": 80,
    "description": "Kratzer an der Felgenabdeckung vorne rechts."
  }
])
</script>

<template>
  <div>
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <NuxtLink to="/" class="btn btn-outline-secondary">Back to Home</NuxtLink>
        <h1>Kangoo Damage Inspection</h1>
        <div style="width: 120px"></div> <!-- Spacer to balance the layout -->
      </div>

      <CarDamageViewer 
        :damage-images="kangooDamageImages" 
        car-model="kangoo"
        title="" 
      />
    </div>
  </div>
</template>
