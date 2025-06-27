<script setup lang="ts">
  // Component for displaying car damage images with schematics
  interface Props {
    damageEntries: DamageEntry[]
    carModel: string
    title: string
  }

  defineProps<Props>()
</script>

<template>
  <div class="flex items-center mb-4 relative">
    <NuxtLink to="/" class="absolute left-0">
      <Button variant="outline">Zurück</Button>
    </NuxtLink>
    <h2 class="w-full text-center text-lg sm:text-xl md:text-2xl font-bold">
      {{ title }}
    </h2>
  </div>

  <div class="flex flex-wrap w-full">
    <div class="w-full mx-auto">
      <!-- All Damage Images -->
      <div v-for="damageEntry in damageEntries" :key="damageEntry.path" class="mb-2">
        <CarDamageImage :damage-entry="damageEntry" :car-model="carModel" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
