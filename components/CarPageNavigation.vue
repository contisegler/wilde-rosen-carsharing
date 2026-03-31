<script setup lang="ts">
interface Props {
  carId: string
  currentView: "damages" | "log"
  showReportButton?: boolean
  disabled?: boolean
  hideViewButtons?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showReportButton: false,
  disabled: false,
  hideViewButtons: false,
})

const route = useRoute()
const user = useCurrentUser()

// Check if user is a damage reporter
const { isDamageReporter } = user.value?.uid
  ? useUserData({ userId: user.value.uid })
  : { isDamageReporter: ref(false) }

// Available cars
const cars = [
  { id: "kangoo", label: "Kangoo" },
  { id: "kona", label: "Kona" },
  { id: "zoe", label: "Zoe" },
  { id: "jogger", label: "Jogger" },
]

// Handle car selection change
function handleCarChange(newCarId: any) {
  if (newCarId && typeof newCarId === "string") {
    navigateTo(`/cars/${newCarId}/${props.currentView}`)
  }
}

// Handle view change
function switchToDamages() {
  navigateTo(`/cars/${props.carId}/damages`)
}

function switchToLog() {
  navigateTo(`/cars/${props.carId}/log`)
}

function reportDamage() {
  navigateTo(`/cars/${props.carId}/damages/add`)
}
</script>

<template>
  <div class="mb-4 space-y-3">
    <div class="flex items-center gap-2">
      <Select :model-value="carId" @update:model-value="handleCarChange" :disabled="disabled">
        <SelectTrigger :class="[hideViewButtons ? 'w-full' : 'flex-1', { 'opacity-50 cursor-not-allowed': disabled }]">
          <div class="flex items-center gap-2">
            <LucideCar class="w-4 h-4" />
            <SelectValue :placeholder="carId" class="font-bold" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="car in cars" :key="car.id" :value="car.id">
            {{ car.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        v-if="!hideViewButtons"
        variant="outline"
        :style="currentView === 'log' ? { backgroundColor: '#798b26' } : {}"
        :disabled="disabled"
        @click="switchToLog"
      >
        <LucideNotebook class="w-4 h-4 mr-1" />
        Fahrtenbuch
      </Button>

      <Button
        v-if="!hideViewButtons"
        variant="outline"
        :style="currentView === 'damages' ? { backgroundColor: '#798b26' } : {}"
        :disabled="disabled"
        @click="switchToDamages"
      >
        <LucideWrench class="w-4 h-4 mr-1" />
        Schäden
      </Button>
    </div>

    <Button
      v-if="showReportButton && isDamageReporter && currentView === 'damages'"
      variant="default"
      size="lg"
      class="w-full font-bold"
      @click="reportDamage"
    >
      <LucideAlertTriangle class="w-4 h-4 mr-2" />
      Schaden melden
    </Button>
  </div>
</template>
