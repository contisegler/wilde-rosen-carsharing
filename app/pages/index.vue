<script setup lang="ts">
const user = useUser()
</script>

<template>
  <div class="flex flex-col gap-4 max-w-md mx-auto">
    <div class="mb-4 text-center text-gray-600">
      Willkommen! Wähle ein Auto, um Schäden oder das Fahrtenbuch anzusehen.
    </div>
    <NuxtLink to="/cars/kangoo/damages" class="w-full">
      <UButton variant="outline" class="w-full font-bold">Kangoo</UButton>
    </NuxtLink>
    <NuxtLink to="/cars/kona/damages" class="w-full">
      <UButton variant="outline" class="w-full font-bold">Kona</UButton>
    </NuxtLink>
    <NuxtLink to="/cars/zoe/damages" class="w-full">
      <UButton variant="outline" class="w-full font-bold">Zoe</UButton>
    </NuxtLink>
    <NuxtLink to="/cars/jogger/damages" class="w-full">
      <UButton variant="outline" class="w-full font-bold">Jogger</UButton>
    </NuxtLink>
  </div>
</template>
