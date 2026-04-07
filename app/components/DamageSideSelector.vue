<script setup lang="ts">
import { ref as storageRef, getDownloadURL } from 'firebase/storage'
import type { CarSide } from '~~/shared/types'

interface Props {
  carId: string
  modelValue: CarSide | null
  damageX: number
  damageY: number
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: CarSide | null): void
  (e: 'update:damageX' | 'update:damageY', value: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedSide = computed({
  get: () => props.modelValue ?? undefined,
  set: value => emit('update:modelValue', value as CarSide | null),
})

const schematicUrl = ref<string | null>(null)
const schematicLoaded = ref(false)

const sideOptions = [
  { value: 'left', label: 'Links' },
  { value: 'back', label: 'Hinten' },
  { value: 'right', label: 'Rechts' },
  { value: 'front', label: 'Vorne' },
  { value: 'top', label: 'Oben' },
]

// Load schematic URL when side changes
if (import.meta.client) {
  watch(() => selectedSide.value, async (newSide) => {
    if (!newSide) {
      schematicUrl.value = null
      return
    }
    
    try {
      const storage = useFirebaseStorage()
      const path = `cars/${props.carId}/schematics/${props.carId}_${newSide}.png`
      const fileRef = storageRef(storage, path)
      schematicUrl.value = await getDownloadURL(fileRef)
      schematicLoaded.value = false
    } catch (error) {
      console.error('Error loading schematic:', error)
      schematicUrl.value = null
    }
  }, { immediate: true })
}

function handleSchematicClick(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()

  const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100))
  const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))

  emit('update:damageX', x)
  emit('update:damageY', y)
}
</script>

<template>
  <div :class="{ 'opacity-50': disabled }">
    <label class="block text-left font-medium text-gray-700 mb-2">
      Fahrzeugseite:
    </label>
    <USelectMenu
      v-model="selectedSide"
      :items="sideOptions"
      value-key="value"
      :disabled="disabled"
      class="w-full mb-4"
    />

    <div class="min-h-[150px]">
      <div v-if="selectedSide && schematicUrl" class="w-full">
        <label class="block text-left font-medium text-gray-700 mb-2">
          Schadensposition (X: {{ Math.round(damageX) }}%, Y: {{ Math.round(damageY) }}%)
        </label>
        <div class="flex justify-center pb-6">
          <div class="relative inline-block">
            <FirebaseNuxtImg
              :src="schematicUrl"
              class="cursor-crosshair max-w-full"
              alt="Car side schematic"
              loading="lazy"
              format="webp"
              :quality="90"
              sizes="sm:100vw md:80vw lg:60vw"
              @load="schematicLoaded = true"
              @mousedown="handleSchematicClick"
            />
            <div
              v-if="schematicLoaded"
              class="damage-x-marker"
              :style="{
                left: `${damageX}%`,
                top: `${damageY}%`,
              }"
            >
              X
            </div>
          </div>
        </div>
      </div>
      <div v-else class="mb-4 p-4 bg-gray-50 rounded-md text-center text-gray-600">
        Bitte wähle eine Fahrzeugseite aus, um die Schadensposition zu markieren.
      </div>
    </div>
  </div>
</template>

<style scoped>
.damage-x-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  color: red;
  font-weight: bold;
  font-size: 24px;
  text-shadow:
    -1px -1px 0 #fff,
    1px -1px 0 #fff,
    -1px 1px 0 #fff,
    1px 1px 0 #fff;
  pointer-events: none;
}

@media (max-width: 576px) {
  .damage-x-marker {
    font-size: 16px;
    text-shadow:
      -0.5px -0.5px 0 #fff,
      0.5px -0.5px 0 #fff,
      -0.5px 0.5px 0 #fff,
      0.5px 0.5px 0 #fff;
  }
}

@media (max-width: 375px) {
  .damage-x-marker {
    font-size: 14px;
  }
}
</style>
