<script setup lang="ts">
// Page for displaying Kangoo damage images with schematics

// Define image paths - in a real optimization, this data would be moved to a shared data file
// or fetched from an API, but for now we're keeping it here for simplicity
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
    <div class="d-flex justify-content-between align-items-center mb-4">
      <NuxtLink to="/" class="btn btn-outline-secondary">Zurück zur Startseite</NuxtLink>
      <h1>Kangoo Schäden</h1>
      <div style="width: 120px"></div> <!-- Spacer to balance the layout -->
    </div>

    <CarDamageViewer 
      :damage-images="kangooDamageImages" 
      car-model="kangoo"
      title="" 
    />
  </div>
</template>
