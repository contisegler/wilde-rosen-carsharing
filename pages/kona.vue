<script setup lang="ts">
// Page for displaying Kona damage images with schematics

// Define image paths
const konaDamageImages = ref<DamageEntry[]>([])
</script>

<template>
  <div>
    <div class="flex items-center mb-4 relative">
      <NuxtLink to="/" class="absolute left-0">
        <Button variant="outline">Zurück</Button>
      </NuxtLink>
      <h1 class="w-full text-center">Kona Schäden</h1>
    </div>

    <CarDamageViewer 
      :damage-images="konaDamageImages" 
      car-model="kona"
      title="" 
    />
  </div>
</template>
