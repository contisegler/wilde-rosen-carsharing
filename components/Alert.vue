<script setup lang="ts">
defineProps({
  type: {
    type: String,
    default: 'primary',
    validator: (value: string) => [
      'primary',
      'secondary',
      'success',
      'danger',
      'warning',
      'info',
      'light',
      'dark'
    ].includes(value)
  }
});
</script>

<template>
  <div class="alert" :class="'alert-' + type" role="alert">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
</style>
