<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold mb-8">Color Scheme Test - #798b26</h1>
    
    <!-- Primary Color Palette -->
    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Primary Color Palette</h2>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div v-for="shade in [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]" :key="shade" 
             :class="`bg-primary-${shade} p-4 rounded-lg text-center`">
          <div :class="shade >= 600 ? 'text-white' : 'text-gray-900'">
            <div class="font-semibold">{{ shade }}</div>
            <div class="text-sm">primary-{{ shade }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- UI Components with Primary Color -->
    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">UI Components</h2>
      <div class="space-y-4">
        <div class="flex flex-wrap gap-4">
          <UButton color="primary">Primary Button</UButton>
          <UButton color="primary" variant="soft">Soft Primary</UButton>
          <UButton color="primary" variant="outline">Outline Primary</UButton>
          <UButton color="primary" variant="ghost">Ghost Primary</UButton>
        </div>

        <div class="flex flex-wrap gap-4">
          <UBadge color="primary">Primary Badge</UBadge>
          <UBadge color="primary" variant="soft">Soft Badge</UBadge>
          <UBadge color="primary" variant="outline">Outline Badge</UBadge>
        </div>

        <div class="max-w-md">
          <UInput color="primary" placeholder="Primary input" />
        </div>

        <div class="max-w-md">
          <UAlert color="primary" title="Primary Alert" description="This is a primary colored alert" />
        </div>

        <div class="max-w-md">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Card with Primary Accent</h3>
            </template>
            <p class="text-gray-600 dark:text-gray-400">This card demonstrates the primary color scheme integration.</p>
            <template #footer>
              <UButton color="primary" block>Primary Action</UButton>
            </template>
          </UCard>
        </div>
      </div>
    </div>

    <!-- Background Examples -->
    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Background Examples</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-primary-500 text-white p-6 rounded-lg">
          <h3 class="font-bold mb-2">Active Element</h3>
          <p>Using primary-500 (#798b26)</p>
        </div>
        <div class="bg-primary-100 dark:bg-primary-900 p-6 rounded-lg">
          <h3 class="font-bold mb-2">Subtle Background</h3>
          <p>Using primary-100 / primary-900</p>
        </div>
        <div class="border-2 border-primary-500 p-6 rounded-lg">
          <h3 class="font-bold mb-2">Border Accent</h3>
          <p>Using border-primary-500</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Color scheme test page
</script>
