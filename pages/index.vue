<script setup lang="ts">
</script>

<template>
  <div class="container mt-5">
    <div class="text-center">
      <h1 class="mb-5">Welcome to Car Damage Inspector</h1>
      <div class="d-flex flex-column gap-3 align-items-center">
        <NuxtLink to="/kangoo" class="btn btn-primary btn-lg w-50">Kangoo Damage Inspection</NuxtLink>
        <NuxtLink to="/kona" class="btn btn-primary btn-lg w-50">Kona Damage Inspection</NuxtLink>
        <NuxtLink to="/zoe" class="btn btn-primary btn-lg w-50">Zoe Damage Inspection</NuxtLink>
        <div class="mt-4 pt-3 border-top w-50">
          <NuxtLink to="/damage-entry" class="btn btn-outline-primary btn-lg w-100">
            Create New Damage Report
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
