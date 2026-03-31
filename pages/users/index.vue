<script setup lang="ts">
definePageMeta({
  middleware: "auth",
})
// Redirect /users to home page
navigateTo("/", { redirectCode: 301 })
</script>

<template>
  <div></div>
</template>
