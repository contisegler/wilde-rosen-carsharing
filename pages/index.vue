<script setup lang="ts">
const encoded = ref(useBase64('Hello World').base64)
</script>

<template>
  <div>
    <div class="mt-4">
      <NuxtLink to="/kona" class="btn btn-outline-success me-2">View Kona Damages</NuxtLink>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
