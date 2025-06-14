<script setup lang="ts">
</script>

<template>
  <div class="text-center">
    <h1 class="mb-5">Wilderosen Carsharing Schäden</h1>
    <div class="flex flex-col gap-3 items-center">
      <NuxtLink to="/kangoo" class="w-1/2">
        <Button variant="default" size="lg" class="w-full">Kangoo</Button>
      </NuxtLink>
      <NuxtLink to="/kona" class="w-1/2">
        <Button variant="default" size="lg" class="w-full">Kona</Button>
      </NuxtLink>
      <NuxtLink to="/zoe" class="w-1/2">
        <Button variant="default" size="lg" class="w-full">Zoe</Button>
      </NuxtLink>
      <!-- <div class="mt-4 pt-3 border-top w-50">
        <div class="d-flex flex-column gap-3">
          <NuxtLink to="/zoe-damage-entry" class="btn btn-outline-primary btn-lg">
            Create Zoe Damage Report
          </NuxtLink>
          <NuxtLink to="/kangoo-damage-entry" class="btn btn-outline-primary btn-lg">
            Create Kangoo Damage Report
          </NuxtLink>
        </div>
      </div> -->
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
