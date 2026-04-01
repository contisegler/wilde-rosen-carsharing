<script setup lang="ts">
definePageMeta({
  middleware: "developer",
})

const timeMin = ref("")
const timeMax = ref("")
const apiResponse = ref<any>(null)
const isLoading = ref(false)
const error = ref("")

const setYesterdayToTomorrow = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(23, 59, 59, 999)

  timeMin.value = yesterday.toISOString()
  timeMax.value = tomorrow.toISOString()
}


const setNowToNow = () => {
  const now = new Date()
  timeMin.value = now.toISOString()
  timeMax.value = now.toISOString()
}

const testApi = async () => {
  if (!timeMin.value || !timeMax.value) {
    error.value = "Please provide both timeMin and timeMax"
    return
  }

  isLoading.value = true
  error.value = ""
  apiResponse.value = null

  try {
    const response = await $fetch("/api/calendar/events", {
      method: "POST",
      body: {
        timeMin: timeMin.value,
        timeMax: timeMax.value,
      },
    })
    apiResponse.value = response
  } catch (err: any) {
    error.value = err.message || "Failed to fetch calendar events"
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  setYesterdayToTomorrow()
})
</script>

<template>
  <div class="container mx-auto p-6 max-w-4xl">
    <h1 class="text-3xl font-bold mb-6">Calendar API Test</h1>

    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">API Parameters</h2>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Time Min (ISO 8601)</label>
          <input
            v-model="timeMin"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="2026-03-31T00:00:00Z"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Time Max (ISO 8601)</label>
          <input
            v-model="timeMax"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="2026-04-02T23:59:59Z"
          />
        </div>

        <div class="flex gap-2">
          <button
            @click="testApi"
            :disabled="isLoading"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {{ isLoading ? "Loading..." : "Send Request" }}
          </button>

          <button
            @click="setYesterdayToTomorrow"
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Set Yesterday to Tomorrow
          </button>
          <button
            @click="setNowToNow"
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Set Now to Now
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-800 font-semibold">Error:</p>
      <p class="text-red-700">{{ error }}</p>
    </div>

    <div v-if="apiResponse" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">API Response</h2>

      <div class="mb-4">
        <p class="text-sm text-gray-600">
          Success: <span class="font-semibold">{{ apiResponse.success }}</span>
        </p>
        <p class="text-sm text-gray-600">
          Event Count: <span class="font-semibold">{{ apiResponse.count }}</span>
        </p>
      </div>

      <div class="bg-gray-50 rounded-md p-4 overflow-auto">
        <pre class="text-sm">{{ JSON.stringify(apiResponse, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>
