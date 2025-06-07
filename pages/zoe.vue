<script setup lang="ts">
// Page for displaying Zoe damage images with schematics

// Define image paths - in a real optimization, this data would be moved to a shared data file
// or fetched from an API, but for now we're keeping it here for simplicity
const zoeDamageImages = ref<DamageEntry[]>([
  {
    "path": "/damages/zoe/signal-2025-05-18-193248.jpeg",
    "side": "left",
    "x": 20,
    "y": 79,
    "description": "Dellen und Kratzer an der Felge vorne links."
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
    "path": "/damages/zoe/signal-2025-05-23-173836.jpeg",
    "side": "left",
    "x": 55,
    "y": 60,
    "description": "Kratzer am Türrahmen (B-Säule) vorne links."
  },
  {
    "path": "/damages/zoe/signal-2025-05-18-193431.jpeg",
    "side": "left",
    "x": 69,
    "y": 39,
    "description": "Kleine Delle an der Tür hinten links."
  },
  {
    "path": "/damages/zoe/signal-2025-05-23-173645.jpeg",
    "side": "left",
    "x": 80,
    "y": 53,
    "description": "Kleine Delle am Kotflügel hinten links."
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
    "description": "Mehrere Kratzer am Kotflügel/Stoßstange vorne rechts."
  }
])
</script>

<template>
  <div>
    <div class="d-flex align-items-center mb-4 position-relative">
      <NuxtLink to="/" class="btn btn-outline-secondary position-absolute start-0">Zurück</NuxtLink>
      <h1 class="w-100 text-center">Zoe Schäden</h1>
    </div>

    <CarDamageViewer 
      :damage-images="zoeDamageImages" 
      car-model="zoe"
      title="" 
    />
  </div>
</template>
