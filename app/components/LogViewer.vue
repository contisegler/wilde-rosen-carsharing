<script setup lang="ts">
import type { LogEntry } from '~~/shared/types'
import { CalendarDateTime } from '@internationalized/date'
import * as z from 'zod'

interface Props {
  carId: string
}

const props = defineProps<Props>()
const user = useUser()
const { authHeaders } = useAuthHeaders()
const isMember = computed(() => user.userRoles?.member ?? false)

// Key with user ID triggers refetch on login/logout
const fetchKey = computed(() => `logs-${props.carId}-${user.uid || 'anonymous'}`)

// Fetch log data from API with auth headers
const { data: logs, status: logsStatus, error: logsError, refresh: refreshLogs } = useFetch<LogEntry[]>(`/api/cars/${props.carId}/log`, {
  key: fetchKey,
  headers: authHeaders,
  transform: (data: any[]): LogEntry[] => {
    return data
      .map(log => ({
        ...log,
        startTime: log.startTime ? new Date(log.startTime) : undefined,
        endTime: log.endTime ? new Date(log.endTime) : undefined
      }))
      .sort((a, b) => {
        const aStartKm = a.startKm ?? null
        const bStartKm = b.startKm ?? null
        const aEndKm = a.endKm ?? null
        const bEndKm = b.endKm ?? null
        // Sort by startKm descending (higher startKm = newer tour = comes first)
        if (aStartKm === null) {
          return -1 // a has no startKm, put it after b
        }
        else if (bStartKm === null) {
          return 1 // b has no startKm, put it after a
        }
        else if (aStartKm === bStartKm) {
          // Same startKm: unfinished tours (no endKm) come before finished ones
          if (aEndKm === null) {
            return -1 // a is unfinished, comes before b
          }
          else if (bEndKm === null) {
            return 1 // b is unfinished, comes before a
          }
          // Both finished: higher endKm comes first
          return bEndKm - aEndKm
        }
        return bStartKm - aStartKm // Higher startKm comes first
      })
  }
})

const formError = ref("")
const tourErrors = ref(new Map<string, string>())
const isSubmitting = ref(false)

// --- Type definition for calendar values ---
type CalendarValue = CalendarDateTime | null

// Start form state (plain refs, not persisted across navigation)
const startDateTime = ref<CalendarValue>(null)
const startKm = ref<number | undefined>(undefined)

// --- Start form schema ---
const startFormSchema = z.object({
  startDateTime: z.custom<CalendarDateTime>((val) => val instanceof CalendarDateTime, {
    message: 'Datum und Uhrzeit sind erforderlich'
  }),
  startKm: z.number().min(1, 'Kilometerstand muss größer als 0 sein'),
})

// --- End form schema (validates endKm > startKm) ---
const endFormSchema = z.object({
    startDateTime: z.custom<CalendarDateTime>((val) => val instanceof CalendarDateTime, {
      message: 'Start Datum und Uhrzeit sind erforderlich'
    }),
    startKm: z.number().min(0, 'Start-Kilometerstand ist erforderlich'),
    endDateTime: z.custom<CalendarDateTime>((val) => val instanceof CalendarDateTime, {
      message: 'Ende Datum und Uhrzeit sind erforderlich'
    }),
  endKm: z.number({ message: 'Kilometerstand ist erforderlich' }).min(0),
}).refine((data) => data.endKm > data.startKm, {
  message: 'End-Kilometerstand muss größer als Start-Kilometerstand sein',
  path: ['endKm'],
}).refine((data) => calendarDateTimeToDate(data.endDateTime) > calendarDateTimeToDate(data.startDateTime), {
  message: 'Endzeit muss nach der Startzeit liegen',
  path: ['endDateTime'],
})

// Check if latest tour is from current user and unfinished (hides start form)
const latestTourBlocksStart = computed(() => {
  if (!logs.value?.length || !user.uid) return false
  const latest = logs.value[0] // First in array is latest due to sorting
  return latest.userId === user.uid && (!latest.endTime || !latest.endKm)
})


// Calculate max km for this car from all logs
const maxCarKm = computed(() => {
  if (!logs.value?.length) return 0
  return Math.max(
    ...logs.value.map(log => Math.max(log.endKm ?? 0, log.startKm ?? 0))
  )
})

// Auto-prefill start date/time and km when start form should be shown
function prefillStartFormIfEmpty() {
  // Only prefill if start form should be shown (no blocking tour)
  if (latestTourBlocksStart.value) return
  if (!startDateTime.value) {
    startDateTime.value = nowAsCalendarDateTime()
  }
  if (startKm.value == null && maxCarKm.value > 0) {
    startKm.value = maxCarKm.value
  }
}

// Re-fetch logs when auth token becomes available (SSR loads without token)
watch(authHeaders, (headers) => {
  if (headers.Authorization) refreshLogs()
})

// Prefill when conditions change or logs load
watch([() => latestTourBlocksStart.value, logs], () => {
  prefillStartFormIfEmpty()
}, { immediate: true })

// Note: End date/time and km are NOT auto-prefilled
// User must enter them manually to avoid accidental submissions

function nowAsCalendarDateTime(): CalendarDateTime {
  const now = new Date()
  return new CalendarDateTime(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes())
}

function calendarDateTimeToDate(cdt: CalendarDateTime): Date {
  return new Date(cdt.year, cdt.month - 1, cdt.day, cdt.hour, cdt.minute)
}

function prefillStartDateTime() {
  startDateTime.value = nowAsCalendarDateTime()
}

// Per-tour end form state (for inline end forms)
const tourEndForms = ref(new Map<string, { startDateTime: CalendarValue; startKm: number | undefined; endDateTime: CalendarValue; endKm: number | undefined }>())

function getTourEndForm(tourId: string, log?: LogEntry) {
  if (!tourEndForms.value.has(tourId)) {
    tourEndForms.value.set(tourId, {
      startDateTime: log?.startTime ? dateToCalendarDateTime(log.startTime) : null,
      startKm: log?.startKm,
      endDateTime: null,
      endKm: undefined,
    })
  }
  return tourEndForms.value.get(tourId)!
}

function dateToCalendarDateTime(date: Date): CalendarDateTime {
  return new CalendarDateTime(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes())
}

function prefillTourEndDateTime(tourId: string) {
  const form = getTourEndForm(tourId)
  form.endDateTime = nowAsCalendarDateTime()
}

// Start a new tour
async function onSubmit() {
  if (!startDateTime.value || startKm.value == null) return

  isSubmitting.value = true
  formError.value = ""

  try {
    await $fetch(`/api/cars/${props.carId}/log`, {
      method: "POST",
      headers: authHeaders.value,
      body: {
        startTime: calendarDateTimeToDate(startDateTime.value).toISOString(),
        startKm: startKm.value,
      },
    })
    startDateTime.value = null
    startKm.value = undefined
    await refreshLogs()
  } catch (e: any) {
    console.error('onSubmit failed:', e)
    formError.value = e?.data?.statusMessage || "Fehler beim Speichern"
  } finally {
    isSubmitting.value = false
  }
}

// End a specific tour
async function endTour(tourId: string) {
  const form = getTourEndForm(tourId)
  if (!form.startDateTime || form.startKm == null || !form.endDateTime || form.endKm == null) {
    tourErrors.value.set(tourId, "Alle Felder sind erforderlich")
    return
  }

  isSubmitting.value = true
  tourErrors.value.set(tourId, "")

  try {
    await $fetch(`/api/cars/${props.carId}/log/${tourId}`, {
      method: "PATCH",
      headers: authHeaders.value,
      body: {
        startTime: calendarDateTimeToDate(form.startDateTime).toISOString(),
        startKm: form.startKm,
        endTime: calendarDateTimeToDate(form.endDateTime).toISOString(),
        endKm: form.endKm,
      },
    })
    // Clear this tour's form
    tourEndForms.value.delete(tourId)
    await refreshLogs()
  } catch (e: any) {
    console.error('endTour failed:', e)
    tourErrors.value.set(tourId, e?.data?.statusMessage || "Fehler beim Beenden der Fahrt")
  } finally {
    isSubmitting.value = false
  }
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function formatDate(date: Date | undefined): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function formatTime(date: Date | undefined): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat("de-DE", {
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
    <!-- Neue Fahrt starten Form - Hidden only if latest tour is from current user and unfinished -->
    <UForm
      v-if="isMember && !latestTourBlocksStart"
      :schema="startFormSchema"
      :state="{ startDateTime: startDateTime ?? undefined, startKm: startKm ?? 0 }"
      class="border rounded-lg p-4 mb-4 bg-blue-50 shadow-sm space-y-3"
      @submit="onSubmit"
    >
      <h3 class="font-semibold text-sm">Neue Fahrt starten</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <UFormField label="Start Datum & Uhrzeit" name="startDateTime">
          <div class="flex gap-1 items-center">
            <DateTimeInput
              v-model="startDateTime"
              icon="i-lucide-calendar-clock"
              class="flex-1"
            />
            <UButton
              type="button"
              size="sm"
              variant="ghost"
              color="neutral"
              icon="i-lucide-clock"
              title="Jetzt"
              @click="prefillStartDateTime"
            />
          </div>
        </UFormField>
        <UFormField label="Start Kilometerstand" name="startKm">
          <UInputNumber
            v-model="startKm"
            :min="0"
            :step="1"
            placeholder="km"
            :increment="false"
            :decrement="false"
          />
        </UFormField>
      </div>
      <p v-if="formError" class="text-red-600 text-sm">{{ formError }}</p>
      <UButton
        type="submit"
        block
        :loading="isSubmitting"
      >
        Fahrt starten
      </UButton>
    </UForm>

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
        <div v-if="isMember && log.userName" class="font-semibold text-sm mb-1">{{ log.userName }}</div>

        <!-- Show info display OR end form for current user's unfinished tours -->
        <div v-if="!(isMember && log.userId === user.uid && (!log.endTime || !log.endKm))">
          <div class="grid grid-cols-[auto_auto_auto_auto] gap-x-1 gap-y-1 text-sm">
            <span class="text-gray-600 mr-3">Start:</span>
            <span class="font-medium text-right mr-2">{{ formatDate(log.startTime) }}</span>
            <span class="font-medium text-left mr-3">{{ formatTime(log.startTime) }}</span>
            <span class="font-medium text-right">{{ log.startKm ?? '-' }} km</span>
            <template v-if="log.endKm || log.endTime">
              <span class="text-gray-600 mr-3">Ende:</span>
              <span class="font-medium text-right mr-2">{{ formatDate(log.endTime) }}</span>
              <span class="font-medium text-left mr-3">{{ formatTime(log.endTime) }}</span>
              <span class="font-medium text-right">{{ log.endKm ?? '-' }} km</span>
              <span></span>
              <span></span>
              <span class="text-gray-600 text-left mr-3">{{ log.startTime && log.endTime ? calculateDuration(log.startTime, log.endTime) : '-' }}</span>
              <span class="text-gray-600 text-right">{{ log.endKm && log.startKm ? `${log.endKm - log.startKm} km` : '-' }}</span>
            </template>
          </div>
        </div>

        <!-- Inline End Form for current user's unfinished tours -->
        <UForm
          v-else
          :schema="endFormSchema"
          :state="{ startDateTime: getTourEndForm(log.id, log).startDateTime ?? undefined, startKm: getTourEndForm(log.id, log).startKm, endDateTime: getTourEndForm(log.id, log).endDateTime ?? undefined, endKm: getTourEndForm(log.id, log).endKm }"
          class="mt-3 pt-3 border-t bg-blue-50 -mx-3 -mb-3 p-3 rounded-b-lg space-y-3"
          @submit="endTour(log.id)"
        >
          <h4 class="font-semibold text-sm mb-2">Offene Fahrt beenden</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UFormField label="Start Datum & Uhrzeit" name="startDateTime">
              <div class="flex gap-1 items-center">
                <DateTimeInput
                  :model-value="getTourEndForm(log.id, log).startDateTime"
                  @update:model-value="(val) => getTourEndForm(log.id, log).startDateTime = val"
                  icon="i-lucide-calendar-clock"
                  class="flex-1"
                />
              </div>
            </UFormField>
            <UFormField label="Start Kilometerstand" name="startKm">
              <UInputNumber
                :model-value="getTourEndForm(log.id, log).startKm"
                @update:model-value="(val) => getTourEndForm(log.id, log).startKm = val"
                :min="0"
                :step="1"
                placeholder="km"
                :increment="false"
                :decrement="false"
              />
            </UFormField>
            <UFormField label="Ende Datum & Uhrzeit" name="endDateTime">
              <div class="flex gap-1 items-center">
                <DateTimeInput
                  :model-value="getTourEndForm(log.id, log).endDateTime"
                  @update:model-value="(val) => getTourEndForm(log.id, log).endDateTime = val"
                  icon="i-lucide-calendar-clock"
                  class="flex-1"
                />
                <UButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-clock"
                  title="Jetzt"
                  @click="prefillTourEndDateTime(log.id)"
                />
              </div>
            </UFormField>
            <UFormField label="Ende Kilometerstand" name="endKm">
              <UInputNumber
                :model-value="getTourEndForm(log.id, log).endKm"
                @update:model-value="(val) => getTourEndForm(log.id, log).endKm = val"
                :min="0"
                :step="1"
                placeholder="km"
                :increment="false"
                :decrement="false"
              />
            </UFormField>
          </div>
          <p v-if="tourErrors.get(log.id)" class="text-red-600 text-sm">{{ tourErrors.get(log.id) }}</p>
          <UButton
            type="submit"
            block
            :loading="isSubmitting"
          >
            Fahrt beenden
          </UButton>
        </UForm>

        <div v-if="isMember && log.notes" class="mt-1 text-sm text-gray-700 italic">
          {{ log.notes }}
        </div>
      </div>
    </div>
  </div>
</template>
