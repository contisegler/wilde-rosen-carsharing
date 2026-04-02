<script setup lang="ts">
import type { LogEntry } from '~~/shared/types'

interface Props {
  carId: string
}

const props = defineProps<Props>()
const user = useUser()

// Fetch log data from API
const { data: logs, status: logsStatus, error: logsError } = useFetch<LogEntry[]>(`/api/cars/${props.carId}/log`, {
  key: `logs-${props.carId}`,
  transform: (data: any[]): LogEntry[] => {
    return data.map(log => ({
      ...log,
      startTime: new Date(log.startTime),
      endTime: new Date(log.endTime)
    }))
  }
})

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function calculateDuration(start: Date, end: Date): string {
  const diff = end.getTime() - start.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }
  return `${hours}h ${minutes}m`
}
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="logsStatus === 'pending'" class="text-center p-8">
      <p>Lade Fahrtenbuch...</p>
    </div>

    <!-- Error state -->
    <div
      v-else-if="logsError"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
    >
      <strong class="font-bold">Fehler!</strong>
      <span class="block sm:inline">Das Fahrtenbuch konnte nicht geladen werden.</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="!logs?.length" class="text-center p-8">
      <p class="text-gray-600">Keine Fahrten gefunden.</p>
    </div>

    <!-- Log entries -->
    <div v-else class="space-y-2">
      <div
        v-for="log in logs"
        :key="log.id"
        class="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="font-semibold text-sm mb-1">{{ log.userName }}</div>

        <div class="grid grid-cols-[auto_auto_auto_auto] gap-x-1 gap-y-1 text-sm">
          <span class="text-gray-600 mr-3">Start:</span>
          <span class="font-medium text-right mr-2">{{ formatDateTime(log.startTime).split(', ')[0] }}</span>
          <span class="font-medium text-left mr-3">{{ formatDateTime(log.startTime).split(', ')[1] }}</span>
          <span class="font-medium text-right">{{ log.startKm }} km</span>
          
          <span class="text-gray-600 mr-3">Ende:</span>
          <span class="font-medium text-right mr-2">{{ formatDateTime(log.endTime).split(', ')[0] }}</span>
          <span class="font-medium text-left mr-3">{{ formatDateTime(log.endTime).split(', ')[1] }}</span>
          <span class="font-medium text-right">{{ log.endKm }} km</span>
          
          <span></span>
          <span></span>
          <span class="text-gray-600 text-left mr-3">{{ calculateDuration(log.startTime, log.endTime) }}</span>
          <span class="text-gray-600 text-right">{{ log.endKm - log.startKm }} km</span>
        </div>

        <div v-if="user.isLogged && log.notes" class="mt-1 text-sm text-gray-700 italic">
          {{ log.notes }}
        </div>
      </div>
    </div>
  </div>
</template>
