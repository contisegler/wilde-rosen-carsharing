<script setup lang="ts">
  const _ = defineProps({
    title: {
      type: String,
      required: true,
    },
  })

  const loginError = useLoginError()
  const nuxtError = useError()
</script>

<template>
  <div class="flex flex-col items-center w-full">
    <h2 class="mb-5 text-xl sm:text-2xl font-bold">{{ title }}</h2>
    <Alert v-if="loginError" variant="destructive" class="mb-4">
      <AlertTitle>Fehler beim Login:</AlertTitle>
      <AlertDescription>{{ loginError?.message || loginError?.toString() }}</AlertDescription>
    </Alert>
    <Alert v-if="nuxtError" variant="destructive" class="mb-4">
      <AlertTitle>Nuxt Fehler:</AlertTitle>
      <AlertDescription>{{ nuxtError?.message || nuxtError?.toString() }}</AlertDescription>
    </Alert>
    <slot />
  </div>
</template>
