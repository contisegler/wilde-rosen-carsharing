<script setup lang="ts">
// Define image paths
const konaDamageImages = ref<DamageEntry[]>([
  { 
    path: '/damages/kona/kona_front_30_100.jpg',
    description: 'Damage on the front side at 30% from left, 70% from top',
    x: 30,
    y: 70,
    side: 'front'
  },
  { 
    path: '/damages/kona/kona_front_100_100.jpg',
    description: 'Damage on the front side at 100% from left, 100% from top',
    x: 100,
    y: 100,
    side: 'front'
  },
  { 
    path: '/damages/kona/kona_back_100_150.jpg',
    description: 'Damage on the back side at 100% from left, 50% from top',
    x: 100,
    y: 50,
    side: 'back'
  },
  { 
    path: '/damages/kona/kona_right_20_120.jpg',
    description: 'Damage on the right side at 20% from left, 80% from top',
    x: 20,
    y: 80,
    side: 'right'
  }
])
</script>

<template>
  <div>
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <NuxtLink to="/" class="btn btn-outline-secondary">Back to Home</NuxtLink>
        <h1>Kona Damage Inspection</h1>
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
