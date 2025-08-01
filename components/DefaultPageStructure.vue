<script setup lang="ts">
  const router = useRouter()
  const route = useRoute()
  const loginError = useLoginError()
  const nuxtError = useError()
</script>

<template>
  <div class="flex flex-col w-full">
    <div class="flex flex-row items-center justify-between w-full mb-4">
      <Button
        :class="[
          route.path === '/' ? 'invisible w-10 h-10' : '',
          'flex-shrink-0 rounded-full w-10 h-10',
        ]"
        variant="outline"
        size="sm"
        aria-label="Zurück"
        @click="router.back()"
      >
        <LucideArrowLeft class="w-5 h-5" />
      </Button>

      <h2 class="text-center text-xl sm:text-2xl font-bold">
        <slot name="title" />
      </h2>
      <Button
        variant="outline"
        size="sm"
        class="invisible flex-shrink-0 rounded-full w-10 h-10"
        aria-label="Vor'"
      >
        <LucideArrowRight class="w-5 h-5" />
      </Button>
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
