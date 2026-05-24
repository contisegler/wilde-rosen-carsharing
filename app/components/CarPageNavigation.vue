<script setup lang="ts">
interface Props {
  carId: string
  currentView: "damages" | "log"
  disabled?: boolean
  hideViewButtons?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  hideViewButtons: false,
})

const { data: cars } = useFetch('/api/cars', {
  key: 'cars-list'
})

const selectedCarId = computed({
  get: () => props.carId,
  set: (newCarId: string) => {
    if (newCarId) {
      navigateTo(`/cars/${newCarId}/${props.currentView}`)
    }
  }
})

function switchToDamages() {
  navigateTo(`/cars/${props.carId}/damages`)
}

function switchToLog() {
  navigateTo(`/cars/${props.carId}/log`)
}
</script>

<template>
  <div class="mb-4 space-y-3">
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <USelectMenu
        v-model="selectedCarId"
        :items="cars || []"
        value-key="id"
        label-key="title"
        :search-input="false"
        :disabled="disabled"
        :class="[hideViewButtons ? 'w-full' : 'w-full sm:flex-1']"
        icon="i-lucide-car"
        size="lg"
        :ui="{ value: 'font-bold' }"
      />

      <div v-if="!hideViewButtons" class="flex gap-2">
        <UButton
          :variant="currentView === 'log' ? 'solid' : 'outline'"
          class="flex-1 sm:flex-none"
          :color="currentView === 'log' ? 'primary' : 'neutral'"
          :disabled="disabled"
          @click="switchToLog"
          icon="i-lucide-notebook"
        >
          Fahrtenbuch
        </UButton>

        <UButton
          :variant="currentView === 'damages' ? 'solid' : 'outline'"
          class="flex-1 sm:flex-none"
          :color="currentView === 'damages' ? 'primary' : 'neutral'"
          :disabled="disabled"
          @click="switchToDamages"
          icon="i-lucide-wrench"
        >
          Schäden
        </UButton>
      </div>
    </div>
  </div>
</template>
