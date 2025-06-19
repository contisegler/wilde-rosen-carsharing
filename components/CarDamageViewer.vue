<script setup lang="ts">
  // Component for displaying car damage images with schematics

  // Easy Lightbox state
  const lightboxVisible = ref<boolean[]>([])
  const schematicLoaded = ref<boolean[]>([])

  interface Props {
    damageImages: DamageEntry[]
    carModel: string
    title: string
  }

  const props = defineProps<Props>()

  // Use the shared getSchematicPath function with the car model from props
  const getCarSchematicPath = (side: string) => {
    return getSchematicPath(props.carModel, side)
  }

  const getLightboxImages = (detail_paths: DetailPath[]) => {
    return detail_paths.map((detail_path, index) => ({
      src: detail_path.src,
      title: index + 1 + ": " + detail_path.title,
    }))
  }

  // Initialize lightbox images from damage entries
  watchEffect(() => {
    if (props.damageImages && props.damageImages.length > 0) {
      lightboxVisible.value = new Array(props.damageImages.length).fill(false)
      schematicLoaded.value = new Array(props.damageImages.length).fill(false)
    }
  })
</script>

<template>
  <div class="flex items-center mb-4 relative">
    <NuxtLink to="/" class="absolute left-0">
      <Button variant="outline">Zurück</Button>
    </NuxtLink>
    <h2 class="w-full text-center text-lg sm:text-xl md:text-2xl font-bold">
      {{ title }}
    </h2>
  </div>

  <div class="flex flex-wrap w-full">
    <div class="w-full mx-auto">
      <!-- All Damage Images -->
      <div v-for="(image, index) in damageImages" :key="index" class="mb-2">
        <div class="relative group min-h-[90px]">
          <!-- Main Damage Image with NuxtImg -->
          <div class="overflow-hidden">
            <NuxtImg
              :src="image.path"
              class="w-full h-auto max-w-full max-h-[600px] object-contain cursor-pointer transition-all duration-300 group-hover:brightness-90"
              :alt="'Car damage: ' + image.description"
              sizes="sm:80vw md:60vw lg:500px"
              format="webp"
              quality="70"
              loading="lazy"
              fit="inside"
              placeholder
              @click="() => (lightboxVisible[index] = true)"
            />
          </div>

          <!-- Badge showing number of detail images -->
          <Badge
            v-if="image.detail_paths?.length"
            class="absolute top-2 left-2 bg-black/80 text-white opacity-50 text-sm md:text-base"
            variant="default"
          >
            {{ image.detail_paths.length }}
          </Badge>

          <!-- Schematic Overlay -->
          <div v-if="getCarSchematicPath(image.side)" class="absolute top-2 right-2">
            <div class="relative">
              <NuxtImg
                :src="getCarSchematicPath(image.side)"
                class="opacity-70"
                :alt="'Schematic for ' + props.carModel + ' ' + image.side + ' side'"
                sizes="sm:30vw md:225px"
                loading="lazy"
                format="webp"
                quality="60"
                fit="contain"
                @load="schematicLoaded[index] = true"
              />
              <div
                v-if="schematicLoaded[index]"
                class="damage-x-marker"
                :style="{ left: image.x + '%', top: image.y + '%' }"
              >
                X
              </div>
            </div>
          </div>

          <!-- Description overlaid on the image -->
          <div
            class="absolute bottom-0 left-0 right-0 p-2 bg-black/80 text-white opacity-50 text-sm md:text-base text-center"
          >
            {{ image.description }}
          </div>
        </div>
        <!-- Use VueEasyLightbox with detail_paths -->
        <VueEasyLightbox
          v-if="image.detail_paths"
          :visible="lightboxVisible[index]"
          :imgs="getLightboxImages(image.detail_paths)"
          :index="0"
          :rotate-disabled="true"
          :zoom-scale="0.5"
          :min-zoom="0.5"
          :loop="true"
          @hide="lightboxVisible = lightboxVisible.map(() => false)"
        />
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

  /* Responsive adjustments for the damage marker */
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
