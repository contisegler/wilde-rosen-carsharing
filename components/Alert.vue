<template>
  <div class="alert" :class="'alert-' + type" role="alert">
    <slot>{{ message }}</slot>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'primary',
    validator: (value) => [
      'primary',
      'secondary',
      'success',
      'danger',
      'warning',
      'info',
      'light',
      'dark'
    ].includes(value)
  },
  message: {
    type: String,
    default: ''
  }
});
</script>

<style scoped lang="scss">
// Additional styling for the alert component can be added here
</style>
