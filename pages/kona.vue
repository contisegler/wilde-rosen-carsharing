<script setup lang="ts">
  // Page for displaying Kona damage images with schematics

  // Define image paths
  // Note: Currently empty as there are no Kona damage images yet
  // Example structure for future entries:
  // {
  //   path: "/damages/kona/example.jpg",
  //   side: "front",
  //   x: 50,
  //   y: 50,
  //   description: "Example damage description",
  //   detail_paths: [
  //     { src: "/damages/kona/example.jpg", title: "Example damage description" }
  //   ]
  // }
  const konaDamageImages = ref<DamageEntry[]>([])
</script>

<template>
  <div>
    <CarDamageViewer :damage-images="konaDamageImages" car-model="kona" title="Kona" />
  </div>
</template>
