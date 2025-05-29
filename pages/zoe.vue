<script setup lang="ts">
// Page for displaying Zoe damage images with schematics

// Define image paths
const zoeDamageImages = ref<DamageEntry[]>([
  {
    "path": "/damages/zoe/signal-2025-05-18-193248.jpeg",
    "side": "left",
    "x": 20,
    "y": 79,
    "description": "Dellen und Krantzer an der Felge vorne links."
  },
  {
    "path": "/damages/zoe/signal-2025-05-18-193335.jpeg",
    "side": "left",
    "x": 20,
    "y": 79,
    "description": "Delle an der Felge vorne links."
  },
  {
    "path": "/damages/zoe/signal-2025-05-18-193348.jpeg",
    "side": "left",
    "x": 20,
    "y": 80,
    "description": "Kratzer an der Felge vorne links."
  },
  {
    "path": "/damages/zoe/signal-2025-05-18-193431.jpeg",
    "side": "left",
    "x": 69,
    "y": 39,
    "description": "Delle an der Tür hinten links."
  },
  {
    "path": "/damages/zoe/signal-2025-05-18-193556.jpeg",
    "side": "left",
    "x": 83,
    "y": 79,
    "description": "Korrosion an der Felge hinten links."
  },
  {
    "path": "/damages/zoe/signal-2025-05-18-193504.jpeg",
    "side": "right",
    "x": 17,
    "y": 50,
    "description": "Tiefe Kratzer und Dellen am Kotflügel hinten rechts."
  },
  {
    "path": "/damages/zoe/signal-2025-05-18-193635.jpeg",
    "side": "right",
    "x": 16,
    "y": 79,
    "description": "Korrosion und Kratzer an der Felge hinten rechts."
  },
  {
    "path": "/damages/zoe/signal-2025-05-18-193703.jpeg",
    "side": "right",
    "x": 17,
    "y": 79,
    "description": "Korrosion und Kratzer an der Felge hinten rechts."
  },
  {
    "path": "/damages/zoe/signal-2025-05-18-193723.jpeg",
    "side": "right",
    "x": 17,
    "y": 80,
    "description": "Korrosion und Kratzer an der Felge hinten rechts."
  },
  {
    "path": "/damages/zoe/signal-2025-05-18-193734.jpeg",
    "side": "right",
    "x": 16,
    "y": 80,
    "description": "Korrosion und Kratzer an der Felge hinten rechts."
  },
  {
    "path": "/damages/zoe/signal-2025-05-18-193750.jpeg",
    "side": "right",
    "x": 33,
    "y": 79,
    "description": "Kratzer unten an der Tür hinten rechts und am Türrahmen."
  },
  {
    "path": "/damages/zoe/signal-2025-05-18-193851.jpeg",
    "side": "right",
    "x": 80,
    "y": 81,
    "description": "Korrosion und Kratzer an der Felge vorne rechts."
  },
  {
    "path": "/damages/zoe/signal-2025-05-18-193929.jpeg",
    "side": "right",
    "x": 90,
    "y": 65,
    "description": "Mehere Kratzer am Korflügel/Stroßstange vonre rechts."
  }
])
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
