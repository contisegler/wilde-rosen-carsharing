<script setup lang="ts">
// Redirect /users/[userId] to /users/[userId]/log
const route = useRoute()
const userId = route.params.userId as string
navigateTo(`/users/${userId}/log`, { redirectCode: 301 })
</script>

<template>
  <div></div>
</template>
