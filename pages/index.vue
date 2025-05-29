<script setup lang="ts">
const encoded = ref(useBase64('Hello World').base64)
</script>

<template>
  <div>
    <p>This is the index page of your Nuxt application. <br>
      <b>Hello World</b> in base64 is {{ encoded }}</p>
    <img src="~/assets/duckling.jpg" alt="Duckling" class="img-fluid mt-0 mb-4" />
    <!-- Using the Alert component with slot content -->
    <Alert type="success">
      This is a success alert from the component!
    </Alert>

    <!-- Using the Alert component with slot content -->
    <Alert type="primary">
      This is a custom alert message using slots!
    </Alert>

    <div class="mt-4">
      <button class="btn btn-primary">Get Started</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
