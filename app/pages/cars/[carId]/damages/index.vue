<script setup lang="ts">
import type { Damage } from '~~/shared/types'

const route = useRoute()
const carId = route.params.carId as string
const user = useUser()
const canReportDamage = computed(() => user.userRoles?.damageReporter ?? false)

const { data: damages, status: damagesStatus, error: damagesError } = useFetch(`/api/cars/${carId}/damages`, {
  key: `damages-${carId}`,
  transform: (data: any[]): Damage[] => {
    return data.map(damage => ({
      ...damage,
      createdAt: new Date(damage.createdAt),
      updatedAt: new Date(damage.updatedAt)
    }))
  }
})
</script>

<template>
  <div>
    <CarPageNavigation :car-id="carId" current-view="damages" />
    
    <!-- Add damage button - only for users with damageReporter role -->
    <div v-if="canReportDamage" class="mb-4 flex justify-end">
      <UButton
        icon="i-lucide-plus"
        color="primary"
        @click="navigateTo(`/cars/${carId}/damages/add`)"
      >
        Neuen Schaden melden
      </UButton>
    </div>
    
    <!-- Loading state -->
    <div v-if="damagesStatus === 'pending'" class="text-center p-8">
      <p>Lade Schadensdaten...</p>
    </div>
    
    <!-- Error state -->
    <div
      v-else-if="damagesError"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <strong class="font-bold">Fehler!</strong>
      <span class="block sm:inline">Die Schadensdaten konnten nicht geladen werden.</span>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="!damages || damages.length === 0" class="text-center p-8">
      <p>Keine Schäden gefunden.</p>
      <UButton
        icon="i-lucide-plus"
        color="primary"
        class="mt-4"
        @click="navigateTo(`/cars/${carId}/damages/add`)"
      >
        Ersten Schaden melden
      </UButton>
    </div>
    
    <!-- Damage list -->
    <div v-else>
      <div v-for="damage in damages" :key="damage.id" class="mb-2">
        <CarDamageImage :damage="damage" :car-id="carId" />
      </div>
    </div>
  </div>
</template>
