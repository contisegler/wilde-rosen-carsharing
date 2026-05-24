<script setup lang="ts">
import { CalendarDateTime } from '@internationalized/date'

interface Props {
  modelValue: CalendarDateTime | null
  icon?: string
  disabled?: boolean
  readonly?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: CalendarDateTime | null]
}>()

const isMobile = ref(false)

onMounted(() => {
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
})

const nativeValue = computed({
  get: () => {
    if (!props.modelValue) return ''
    const year = props.modelValue.year.toString().padStart(4, '0')
    const month = props.modelValue.month.toString().padStart(2, '0')
    const day = props.modelValue.day.toString().padStart(2, '0')
    const hour = props.modelValue.hour.toString().padStart(2, '0')
    const minute = props.modelValue.minute.toString().padStart(2, '0')
    return `${year}-${month}-${day}T${hour}:${minute}`
  },
  set: (value: string) => {
    if (!value) {
      emit('update:modelValue', null)
      return
    }
    const date = new Date(value)
    const calendarDateTime = new CalendarDateTime(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes()
    )
    emit('update:modelValue', calendarDateTime)
  }
})

const customValue = computed({
  get: () => props.modelValue,
  set: (value: CalendarDateTime | null) => {
    emit('update:modelValue', value)
  }
})
</script>

<template>
  <input
    v-if="isMobile"
    v-model="nativeValue"
    type="datetime-local"
    :disabled="disabled"
    :readonly="readonly"
    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
  >
  <UInputDate
    v-else
    v-model="customValue"
    granularity="minute"
    :hour-cycle="24"
    :icon="icon"
    :disabled="disabled"
    :readonly="readonly"
  />
</template>
