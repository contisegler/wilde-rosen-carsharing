<script setup lang="ts">
  const user = useCurrentUser()
  
  // Fetch user data to check damage_reporter permission
  const { isDamageReporter } = user.value?.uid 
    ? useUserData({ userId: user.value.uid })
    : { isDamageReporter: ref(false) }
</script>

<template>
  <DefaultPageStructure>
    <template #title>
      <h1>Wilde Rosen Carsharing</h1>
    </template>
    <HalfWidth>
      <div class="mb-4 text-center text-gray-600">
        Willkommen! Wähle ein Auto, um Schäden oder das Fahrtenbuch anzusehen.
      </div>
      <NuxtLink to="/cars/kangoo/damages" class="w-full">
        <Button variant="outline" size="lg" class="w-full font-bold">Kangoo</Button>
      </NuxtLink>
      <NuxtLink to="/cars/kona/damages" class="w-full">
        <Button variant="outline" size="lg" class="w-full font-bold">Kona</Button>
      </NuxtLink>
      <NuxtLink to="/cars/zoe/damages" class="w-full">
        <Button variant="outline" size="lg" class="w-full font-bold">Zoe</Button>
      </NuxtLink>
      <NuxtLink to="/cars/jogger/damages" class="w-full">
        <Button variant="outline" size="lg" class="w-full font-bold">Jogger</Button>
      </NuxtLink>
    </HalfWidth>
  </DefaultPageStructure>
</template>

<style scoped></style>
