<script setup lang="ts"></script>

<template>
  <DefaultPageStructure>
    <template #title>
      <h1>Schäden</h1>
    </template>
    <HalfWidth>
      <NuxtLink to="/kangoo" class="w-full">
        <Button variant="outline" size="lg" class="w-full font-bold">Kangoo</Button>
      </NuxtLink>
      <NuxtLink to="/kona" class="w-full">
        <Button variant="outline" size="lg" class="w-full font-bold">Kona</Button>
      </NuxtLink>
      <NuxtLink to="/zoe" class="w-full">
        <Button variant="outline" size="lg" class="w-full font-bold">Zoe</Button>
      </NuxtLink>
    </HalfWidth>
  </DefaultPageStructure>
</template>

<style scoped></style>
