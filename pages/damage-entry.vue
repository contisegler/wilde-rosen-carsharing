<script setup lang="ts">
// This page will use the DamageEntryForm component
</script>

<template>
  <div class="damage-entry-page">
    <div class="container-fluid mt-4" style="max-width: 1400px;">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <NuxtLink to="/" class="btn btn-outline-secondary">Back to Home</NuxtLink>
        <h1>Create Damage Report</h1>
        <div style="width: 120px"></div> <!-- Spacer for alignment -->
      </div>
      
      <DamageEntryForm car-model="zoe" />
    </div>
  </div>
</template>

<style scoped>
.damage-entry-page {
  padding-bottom: 2rem;
}
</style>
