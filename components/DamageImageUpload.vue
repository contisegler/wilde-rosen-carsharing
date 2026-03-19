<script setup lang="ts">
interface Props {
  carId: string
  modelValue: CloudImage | null
}

interface Emits {
  (e: "update:modelValue", value: CloudImage | null): void
  (e: "uploadError"): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedImage = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value),
})
</script>

<template>
  <div class="mb-4">
    <label class="block text-left font-medium text-gray-700 mb-2">Schadensbild:</label>
    <CloudImageSelector
      :storage-path="`cars/${carId}/damages`"
      :multiple="false"
      :allow-upload="true"
      :allow-browse="true"
      @image-selected="selectedImage = $event"
      @upload-error="emit('uploadError')"
    />

    <div v-if="selectedImage" class="mt-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Ausgewähltes Bild:</h4>
      <div class="relative min-h-[30px]">
        <FirebaseNuxtImg
          :src="selectedImage.url"
          :alt="selectedImage.name"
          class="w-full max-w-full h-auto max-h-[600px] object-cover cursor-pointer transition-all duration-300 group-hover:brightness-90"
          sizes="sm:80vw md:70vw lg:736px"
          format="webp"
          :quality="70"
          loading="lazy"
          :modifiers="{ rotate: 'undefined' }"
          placeholder
        />
        <div
          class="absolute bottom-0 left-0 right-0 p-2 bg-black/80 text-white opacity-50 text-sm md:text-base text-center"
        >
          <div class="truncate font-medium">{{ selectedImage.name }}</div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          class="absolute top-2 right-2"
          @click="selectedImage = null"
        >
          <LucideX class="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
