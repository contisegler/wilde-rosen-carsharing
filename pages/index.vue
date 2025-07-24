<script setup lang="ts">
  const user = useCurrentUser()
</script>

<template>
  <div class="text-center pt-6">
    <div class="flex flex-col gap-3 items-center">
      <NuxtLink to="/kangoo" class="w-1/2">
        <Button variant="outline" size="lg" class="w-full font-bold">Kangoo</Button>
      </NuxtLink>
      <NuxtLink to="/kona" class="w-1/2">
        <Button variant="outline" size="lg" class="w-full font-bold">Kona</Button>
      </NuxtLink>
      <NuxtLink to="/zoe" class="w-1/2">
        <Button variant="outline" size="lg" class="w-full font-bold">Zoe</Button>
      </NuxtLink>
{{ user }}
      <!-- <div class="mt-4 pt-3 border-t w-1/2">
        <div class="flex flex-col gap-3">
          <NuxtLink to="/zoe-damage-entry" class="w-full">
            <Button variant="outline" size="lg" class="w-full">Create Zoe Damage Report</Button>
          </NuxtLink>
          <NuxtLink to="/kangoo-damage-entry" class="w-full">
            <Button variant="outline" size="lg" class="w-full">Create Kangoo Damage Report</Button>
          </NuxtLink>
        </div>
      </div> -->
    </div>
  </div>
</template>

<style scoped></style>
