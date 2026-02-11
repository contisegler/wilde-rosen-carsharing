<script setup lang="ts">
  interface Props {
    src: string | null | undefined
  }

  const props = defineProps<Props>()

  // Convert Firebase Storage URL to alias format for NuxtImg
  const aliasUrl = computed(() => {
    if (!props.src) return ''
    
    // Extract the path and query parameters from the Firebase Storage URL
    // Firebase URLs look like: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile.jpg?alt=media&token=...
    const url = new URL(props.src)
    const pathParts = url.pathname.split('/o/')
    if (pathParts.length < 2) return props.src
    
    const filePath = encodeURIComponent(pathParts[1]) // URL encode the file path
    const queryParams = url.search // This includes ?alt=media&token=...
    
    // Return alias format: /firebase/encoded-path?query-params
    return `/firebase/${filePath}${queryParams}`
  })
</script>

<template>
  <NuxtImg
    v-if="aliasUrl"
    :src="aliasUrl"
  />
</template>