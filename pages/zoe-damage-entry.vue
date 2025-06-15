<script setup lang="ts">
// This page will use the DamageEntryForm component
</script>

<template>
  <div class="damage-entry-page">
    <div class="flex items-center mb-4 relative">
      <NuxtLink to="/" class="absolute left-0">
        <Button variant="outline">Zurück</Button>
      </NuxtLink>
      <h1 class="w-full text-center">Bearbeite Zoe Schäden</h1>
    </div>
    <DamageEntryForm car-model="zoe" />
  </div>
</template>

<style scoped>
.damage-entry-page {
  padding-bottom: 2rem;
}
</style>
