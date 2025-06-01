<script setup lang="ts">
// This page will use the DamageEntryForm component for Kangoo
</script>

<template>
  <div class="damage-entry-page">
    <div class="d-flex align-items-center mb-4 position-relative">
      <NuxtLink to="/" class="btn btn-outline-secondary position-absolute start-0">Back</NuxtLink>
      <h1 class="w-100 text-center">Create Kangoo Damage Report</h1>
    </div>
    
    <DamageEntryForm car-model="kangoo" />
  </div>
</template>

<style scoped>
.damage-entry-page {
  padding-bottom: 2rem;
}
</style>
