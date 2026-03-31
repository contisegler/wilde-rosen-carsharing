<script setup lang="ts">
  const user = useCurrentUser()
  const route = useRoute()
  
  function goToLogin() {
    navigateTo({
      path: '/login',
      query: {
        redirect: route.fullPath,
      },
    })
  }
</script>

<template>
  <div class="w-full max-w-3xl mx-auto px-4 py-3">
    <div class="flex flex-row items-center justify-between w-full mb-5">
      <NuxtLink to="/" class="shrink-0">
        <img src="/carsharing_logo.svg" alt="Logo" class="h-10 w-auto" />
      </NuxtLink>
      <h1 class="text-center text-2xl sm:text-3xl font-bold mx-2">Wilde Rosen Carsharing</h1>
      <UserMenu v-if="user" />
      <Button
        v-else
        variant="outline"
        size="sm"
        class="shrink-0 rounded-full w-10 h-10"
        aria-label="Login"
        @click="goToLogin"
      >
        <LucideLogIn class="w-5 h-5" />
      </Button>
    </div>
    <slot />
  </div>
</template>

<style scoped></style>
