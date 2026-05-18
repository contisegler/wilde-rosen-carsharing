<script setup lang="ts">
import { de } from '@nuxt/ui/locale'

const user = useUser()
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
  <UApp :locale="de">
    <UContainer class="py-3 max-w-3xl">
      <div class="flex flex-row items-center justify-between w-full mb-5">
        <NuxtLink to="/" class="shrink-0">
          <img src="/carsharing_logo.svg" alt="Logo" class="h-10 w-auto" />
        </NuxtLink>
        <h1 class="text-center text-2xl sm:text-3xl font-bold mx-2">Wilde Rosen Carsharing</h1>
        <UserMenu v-if="user.isLogged" />
        <UButton
          v-else
          variant="outline"
          square
          class="shrink-0"
          aria-label="Login"
          icon="i-lucide-log-in"
          @click="goToLogin"
        />
      </div>
      <NuxtPage />
    </UContainer>
  </UApp>
</template>
