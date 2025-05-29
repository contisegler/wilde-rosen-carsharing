<script setup lang="ts">

interface DamageEntry {
  path: string      // URL to the image (either blob URL or static path)
  description: string
  x: number         // X position (0-100%)
  y: number         // Y position (0-100%)
  side: string      // 'front', 'back', 'left', 'right'
}

const showForm = ref(false)

// Define image paths - start with empty array
const kangooDamageImages = ref<DamageEntry[]>([])

const addDamageEntry = (newDamage: DamageEntry) => {
  // Add the new damage to our list
  kangooDamageImages.value.push({
    path: newDamage.path,
    description: newDamage.description,
    x: newDamage.x,
    y: newDamage.y,
    side: newDamage.side
  })
  
  // Reset form
  showForm.value = false
}
</script>

<template>
  <div>
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <NuxtLink to="/" class="btn btn-outline-secondary">Back to Home</NuxtLink>
        <h1>Kangoo Damage Inspection</h1>
        <div style="width: 120px"></div> <!-- Spacer to balance the layout -->
      </div>

      <DamageEntryForm 
        v-if="showForm" 
        car-model="kangoo" 
        class="mb-5"
        @submit="addDamageEntry"
      />

      <CarDamageViewer 
        :damage-images="kangooDamageImages" 
        car-model="kangoo"
        title="" 
      />
      
      <div class="text-center mt-4 mb-5">
        <button 
          class="btn btn-primary" 
          @click="showForm = !showForm"
        >
          {{ showForm ? 'Hide Form' : 'Add New Damage' }}
        </button>
      </div>
    </div>
  </div>
</template>
