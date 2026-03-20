<script setup lang="ts">
interface Props {
  carId: string
  mainImage: CloudImage | null
  mainDescription: string
  modelValue: DamageDetailFormEntry[]
  disabled?: boolean
}

interface Emits {
  (e: "update:modelValue", value: DamageDetailFormEntry[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const extraDetails = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value),
})

function addDetail() {
  extraDetails.value = [...extraDetails.value, { image: null, description: "" }]
}

function removeDetail(index: number) {
  const newDetails = [...extraDetails.value]
  newDetails.splice(index, 1)
  extraDetails.value = newDetails
}

function updateDetailImage(index: number, image: CloudImage | null) {
  const newDetails = [...extraDetails.value]
  newDetails[index].image = image
  extraDetails.value = newDetails
}

function updateDetailDescription(index: number, description: string) {
  const newDetails = [...extraDetails.value]
  newDetails[index].description = description
  extraDetails.value = newDetails
}
</script>

<template>
  <div class="mb-6 transition-opacity" :class="{ 'opacity-50 pointer-events-none': disabled }">
    <h3 class="text-left font-medium text-gray-700 mb-3">Schadensdetails</h3>

    <div class="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
      <div class="flex items-center gap-2 mb-2">
        <Badge variant="secondary">1</Badge>
        <span class="text-sm font-medium text-gray-600">Übersichtsbild (automatisch)</span>
      </div>
      <div class="flex gap-3 items-start">
        <div class="w-20 h-20 shrink-0 overflow-hidden rounded">
          <FirebaseNuxtImg
            v-if="mainImage"
            :src="mainImage.url"
            :alt="mainImage.name"
            class="w-full h-full object-cover"
            sizes="80px"
            :quality="60"
            loading="lazy"
            :modifiers="{ rotate: 'undefined' }"
          />
          <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
            <LucideImage class="w-6 h-6 text-gray-400" />
          </div>
        </div>
        <div class="text-sm text-gray-500 pt-1">
          {{ mainDescription || "—" }}
        </div>
      </div>
    </div>

    <div
      v-for="(detail, index) in extraDetails"
      :key="index"
      class="mb-4 p-3 border border-gray-200 rounded-md"
    >
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <Badge variant="outline">{{ index + 2 }}</Badge>
          <span class="text-sm font-medium text-gray-700">Zusätzliches Detail</span>
        </div>
        <Button variant="ghost" size="sm" @click="removeDetail(index)">
          <LucideTrash2 class="w-4 h-4 text-red-500" />
        </Button>
      </div>

      <div class="mb-2">
        <label class="block text-left text-sm text-gray-600 mb-1">Detailbild:</label>
        <div v-if="detail.image" class="flex gap-3 items-start">
          <div class="relative w-20 h-20 shrink-0 overflow-hidden rounded">
            <FirebaseNuxtImg
              :src="detail.image.url"
              :alt="detail.image.name"
              class="w-full h-full object-cover"
              sizes="80px"
              :quality="60"
              loading="lazy"
              :modifiers="{ rotate: 'undefined' }"
            />
            <Button
              variant="destructive"
              size="icon"
              class="absolute top-0 right-0 w-5 h-5"
              @click="updateDetailImage(index, null)"
            >
              <LucideX class="w-3 h-3" />
            </Button>
          </div>
          <span class="text-xs text-gray-500 pt-1 truncate">{{ detail.image.name }}</span>
        </div>
        <div v-else>
          <CloudImageSelector
            :storage-path="`cars/${carId}/damages`"
            :multiple="false"
            :allow-upload="true"
            :allow-browse="true"
            @image-selected="updateDetailImage(index, $event)"
          />
        </div>
      </div>

      <div>
        <label class="block text-left text-sm text-gray-600 mb-1">Beschreibung:</label>
        <textarea
          :value="detail.description"
          class="w-full p-2 border border-gray-300 rounded-md text-sm"
          rows="2"
          placeholder="Detail beschreiben..."
          @input="updateDetailDescription(index, ($event.target as HTMLTextAreaElement).value)"
        ></textarea>
      </div>
    </div>

    <Button variant="outline" size="sm" class="w-full" @click="addDetail">
      <LucidePlus class="w-4 h-4 mr-2" />
      Weiteres Detail hinzufügen
    </Button>
  </div>
</template>
