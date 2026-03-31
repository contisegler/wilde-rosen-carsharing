<script setup lang="ts">
definePageMeta({
  middleware: "auth",
})

const route = useRoute()
const userId = route.params.userId as string
const user = useCurrentUser()

// Check if user is viewing their own log
const isOwnLog = computed(() => user.value?.uid === userId)

const selectedCar = ref<string | null>(null)

// Available cars
const cars = [
  { id: "kangoo", label: "Kangoo" },
  { id: "kona", label: "Kona" },
  { id: "zoe", label: "Zoe" },
  { id: "jogger", label: "Jogger" },
]

function addNewEntry() {
  if (selectedCar.value) {
    navigateTo(`/cars/${selectedCar.value}/log/add`)
  }
}
</script>

<template>
  <DefaultPageStructure>
    <template #title>Mein Fahrtenbuch</template>
    <div class="flex gap-2 mb-4">
      <Select v-model="selectedCar">
        <SelectTrigger class="flex-1">
          <SelectValue placeholder="Auto wählen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="car in cars" :key="car.id" :value="car.id">
            {{ car.label }}
          </SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="default"
        class="font-bold"
        :disabled="!selectedCar"
        @click="addNewEntry"
      >
        <LucidePlus class="w-4 h-4 mr-2" />
        Starte neue Tour
      </Button>
    </div>
    <LogViewer :id="userId" type="user" />
  </DefaultPageStructure>
</template>
