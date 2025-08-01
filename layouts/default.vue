<script setup lang="ts">
  const user = useCurrentUser()
</script>

<template>
  <div class="w-full max-w-3xl mx-auto px-4 py-3">
    <div class="mb-5">
      <div class="flex flex-row items-center justify-between w-full mb-0">
        <NuxtLink to="/" class="flex-shrink-0">
          <img src="/carsharing_logo.svg" alt="Logo" class="h-10 w-auto" >
        </NuxtLink>
        <h1 class="hidden sm:block flex-1 text-center text-3xl font-bold mx-2">
          Wilde Rosen Carsharing
        </h1>
        <Button variant="outline" size="sm" @click="user ? navigateTo('/profile') : navigateTo('/login')">
          {{ user ? "Profil" : "Anmelden" }}
        </Button>
      </div>
      <h1 class="block sm:hidden text-center text-2xl font-bold mt-3 mb-5">
        Wilde Rosen Carsharing
      </h1>
    </div>
    <slot />
  </div>
</template>

<style scoped></style>
