<script setup lang="ts">
  const loginError = useLoginError()
  const nuxtError = useError()
</script>

<template>
  <div class="flex flex-col w-full">
    <div class="flex flex-row items-center justify-center w-full mb-4">
      <h2 class="text-center text-xl sm:text-2xl font-bold">
        <slot name="title" />
      </h2>
    </div>
    <div class="w-full items-center">
      <Alert v-if="loginError" variant="destructive" class="mb-4">
        <AlertTitle>Fehler beim Login:</AlertTitle>
        <AlertDescription>{{ loginError?.message || loginError?.toString() }}</AlertDescription>
      </Alert>
      <Alert v-if="nuxtError" variant="destructive" class="mb-4">
        <AlertTitle>Nuxt Fehler:</AlertTitle>
        <AlertDescription>{{ nuxtError?.message || nuxtError?.toString() }}</AlertDescription>
      </Alert>
    </div>
    <slot />
  </div>
</template>
