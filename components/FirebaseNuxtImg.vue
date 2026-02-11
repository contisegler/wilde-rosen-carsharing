<script setup lang="ts">
  interface Props {
    src: string | null | undefined
    format?: string
    quality?: string | number
    background?: string
    fit?: string
    modifiers?: Record<string, string | number | boolean | null>
    preset?: string
    provider?: string | null
    sizes?: string | Record<string, string>
    densities?: string
    preload?: boolean | { fetchPriority: 'auto' | 'high' | 'low' }
    width?: string | number
    height?: string | number
    placeholder?: boolean | string | number | [w: number, h: number, q?: number, b?: number]
    placeholderClass?: string
    loading?: 'lazy' | 'eager'
    nonce?: string
    crossorigin?: boolean | 'anonymous' | 'use-credentials'
    custom?: boolean
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
    :format="props.format"
    :quality="props.quality"
    :background="props.background"
    :fit="props.fit"
    :modifiers="(props.modifiers as any)"
    :preset="props.preset"
    :provider="(props.provider as any)"
    :sizes="props.sizes"
    :densities="props.densities"
    :preload="props.preload"
    :width="props.width"
    :height="props.height"
    :placeholder="props.placeholder"
    :placeholder-class="props.placeholderClass"
    :loading="props.loading"
    :nonce="props.nonce"
    :crossorigin="props.crossorigin"
    :custom="props.custom"
  />
</template>