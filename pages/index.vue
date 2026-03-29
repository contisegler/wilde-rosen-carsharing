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
      <h1>Schäden</h1>
    </template>
    <HalfWidth>
      <NuxtLink to="/kangoo" class="w-full">
        <Button variant="outline" size="lg" class="w-full font-bold">Kangoo</Button>
      </NuxtLink>
      <NuxtLink to="/kona" class="w-full">
        <Button variant="outline" size="lg" class="w-full font-bold">Kona</Button>
      </NuxtLink>
      <NuxtLink to="/zoe" class="w-full">
        <Button variant="outline" size="lg" class="w-full font-bold">Zoe</Button>
      </NuxtLink>
      <NuxtLink to="/jogger" class="w-full">
        <Button variant="outline" size="lg" class="w-full font-bold">Jogger</Button>
      </NuxtLink>
      <div v-if="isDamageReporter" class="flex items-center my-4 w-full">
        <hr class="flex-grow border-gray-300" />
      </div>
      <NuxtLink v-if="isDamageReporter" to="/report-damage" class="w-full">
        <Button variant="outline" size="lg" class="w-full font-bold">Schaden melden</Button>
      </NuxtLink>
    </HalfWidth>
  </DefaultPageStructure>
</template>

<style scoped></style>
