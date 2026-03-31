<script setup lang="ts">
definePageMeta({
  middleware: "auth",
})

// Legacy route - redirect to new settings page
const user = useCurrentUser()

if (user.value) {
  navigateTo(`/users/${user.value.uid}/settings`, { redirectCode: 301 })
} else {
  navigateTo("/login")
}
</script>

<template>
  <div></div>
</template>
