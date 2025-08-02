<script setup lang="ts">
  const user = useCurrentUser()
</script>

<template>
  <div class="w-full max-w-3xl mx-auto px-4 py-3">
    <div class="flex flex-row items-center justify-between w-full mb-5">
      <NuxtLink to="/" class="flex-shrink-0">
        <img src="/carsharing_logo.svg" alt="Logo" class="h-10 w-auto" />
      </NuxtLink>
      <h1 class="text-center text-2xl sm:text-3xl font-bold mx-2">Wilde Rosen Carsharing</h1>
      <Button
        variant="outline"
        size="sm"
        :class="user ? 'flex-shrink-0 rounded-full w-10 h-10' : 'invisible flex-shrink-0 rounded-full w-10 h-10'"
        :aria-label="user ? 'Profile' : 'Login'"
        @click="user ? navigateTo('/profile') : navigateTo('/login')"
      >
        <LucideUser v-if="user" class="w-5 h-5" />
        <LucideLogIn v-else class="w-5 h-5" />
      </Button>
    </div>
    <slot />
  </div>
</template>

<style scoped></style>
