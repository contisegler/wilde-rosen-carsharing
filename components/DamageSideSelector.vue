<script setup lang="ts">
import { ref as storageRef } from "firebase/storage"

interface Props {
  carId: string
  modelValue: CarSide | null
  damageX: number
  damageY: number
  disabled?: boolean
}

interface Emits {
  (e: "update:modelValue", value: CarSide | null): void
  (e: "update:damageX" | "update:damageY", value: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedSide = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value),
})

const xPosition = ref([props.damageX])
const yPosition = ref([props.damageY])

watch(
  () => props.damageX,
  newVal => {
    xPosition.value = [newVal]
  },
)

watch(
  () => props.damageY,
  newVal => {
    yPosition.value = [newVal]
  },
)

watch(xPosition, () => {
  emit("update:damageX", xPosition.value[0])
})

watch(yPosition, () => {
  emit("update:damageY", yPosition.value[0])
})

const storage = useFirebaseStorage()

const schematicPath = computed(() => {
  if (!selectedSide.value || !props.carId) return null
  return `cars/${props.carId}/schematics/${props.carId}_${selectedSide.value}.png`
})

const schematicStorageRef = computed(() => {
  if (!schematicPath.value) return null
  return storageRef(storage, schematicPath.value)
})

const schematicUrl = computed(() => {
  if (!schematicStorageRef.value) return null
  return useStorageFileUrl(schematicStorageRef.value).url.value
})

const handleSchematicClick = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()

  const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100))
  const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))

  emit("update:damageX", x)
  emit("update:damageY", y)
  xPosition.value = [x]
  yPosition.value = [y]
}
</script>

<template>
  <div :class="{ 'opacity-50': disabled }">
    <label for="side" class="block text-left font-medium text-gray-700 mb-2">
      Fahrzeugseite:
    </label>
    <select
      id="side"
      v-model="selectedSide"
      class="w-full p-2 mb-4 border border-gray-300 rounded-md"
      :disabled="disabled"
    >
      <option value="front">Vorne</option>
      <option value="back">Hinten</option>
      <option value="left">Links</option>
      <option value="right">Rechts</option>
      <option value="top">Oben</option>
    </select>

    <div class="min-h-[150px]">
      <div v-if="selectedSide && schematicUrl" class="w-full">
        <label class="block text-left font-medium text-gray-700 mb-2">
          Schadensposition (X: {{ Math.round(damageX) }}%, Y: {{ Math.round(damageY) }}%)
        </label>
        <div class="flex justify-center pb-6 pr-6">
          <div class="relative">
            <div class="absolute right-0 top-0 h-full transform translate-x-6">
              <Slider
                v-model="yPosition"
                :min="0"
                :max="100"
                :step="1"
                class="h-full"
                orientation="vertical"
                :inverted="true"
              />
            </div>
            <FirebaseNuxtImg
              :src="schematicUrl"
              class="cursor-crosshair"
              alt="Car side schematic"
              loading="lazy"
              format="webp"
              quality="90"
              sizes="sm:100vw md:80vw lg:60vw"
              @mousedown="handleSchematicClick"
            />
            <div
              class="damage-x-marker"
              :style="{
                left: `${damageX}%`,
                top: `${damageY}%`,
              }"
            >
              X
            </div>
            <div class="absolute bottom-0 left-0 w-full transform translate-y-6">
              <Slider v-model="xPosition" :min="0" :max="100" :step="1" class="w-full" />
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
