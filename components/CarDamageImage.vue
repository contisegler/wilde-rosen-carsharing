<script setup lang="ts">
  import { ref as storageRef } from "firebase/storage"

  interface Props {
    damageEntry: DamageEntry
    carId: string
  }

  const props = defineProps<Props>()

  const user = useCurrentUser()
  const { isDamageReporter } = user.value?.uid 
    ? useUserData({ userId: user.value.uid })
    : { isDamageReporter: computed(() => false) }

  const numDetails = computed(() => {
    return props.damageEntry.details?.length
  })

  const storage = useFirebaseStorage()

  // Add cache-busting timestamp to image URLs
  const cacheBuster = computed(() => {
    const timestamp = props.damageEntry.updatedAt?.getTime() || Date.now()
    return `?t=${timestamp}`
  })

  const imageUrl = computed(() => {
    const url = useStorageFileUrl(storageRef(storage, props.damageEntry.imagePath)).url.value
    return url ? `${url}${cacheBuster.value}` : url
  })
  
  const schematicUrl = useStorageFileUrl(storageRef(storage, props.damageEntry.schematicPath)).url

  const lightboxImages = computed(() => props.damageEntry.details?.map((detail, index) => ({
    src: `${useStorageFileUrl(storageRef(storage, detail.imagePath)).url.value}${cacheBuster.value}`,
    title: (index + 1).toString() + ": " + detail.description,
  })))
  const lightboxVisible = ref<boolean>(false)
  const schematicLoaded = ref<boolean>(false)
</script>

<template>
  <div
    class="relative group min-h-[210px]"
    :data-id="damageEntry.id"
    :data-side="damageEntry.side"
    :data-x="damageEntry.x"
    :data-y="damageEntry.y"
  >
    <!-- Main Damage Image with NuxtImg -->
    <FirebaseNuxtImg
      v-if="imageUrl"
      :src="imageUrl"
      class="w-full max-w-full h-auto max-h-[600px] object-cover cursor-pointer transition-all duration-300 group-hover:brightness-90"
      :alt="'Auto Schaden: ' + damageEntry.description"
      sizes="sm:80vw md:70vw lg:736px"
      format="webp"
      :quality="70"
      loading="lazy"
      :modifiers="{ rotate: 'undefined' }"
      placeholder
      @click="lightboxVisible = true"
    />

    <!-- Badge showing number of detail images -->
    <Badge
      v-if="numDetails"
      class="absolute top-2 left-2 bg-black/80 text-white opacity-50 text-sm md:text-base"
      variant="default"
    >
      {{ numDetails }}
    </Badge>

    <!-- Edit Button (top-right corner, for damage reporters only) -->
    <Button
      v-if="isDamageReporter"
      variant="secondary"
      size="icon"
      class="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white shadow-md"
      @click.stop="navigateTo(`/${carId}/edit-damage?damageId=${damageEntry.id}`)"
    >
      <LucidePencil class="w-4 h-4" />
    </Button>

    <!-- Schematic Overlay -->
    <div class="absolute top-2 right-[60px]">
      <div class="relative">
        <FirebaseNuxtImg
          v-if="schematicUrl"
          :src="schematicUrl"
          class="opacity-70"
          :alt="'Schema für ' + carId + '; Seite: ' + damageEntry.side"
          sizes="sm:30vw md:225px"
          loading="lazy"
          format="webp"
          :quality="60"
          fit="contain"
          @load="schematicLoaded = true"
        />
        <div
          v-if="schematicLoaded"
          class="damage-x-marker"
          :style="{ left: damageEntry.x + '%', top: damageEntry.y + '%' }"
        >
          X
        </div>
      </div>
    </div>

    <!-- Description overlaid on the image -->
    <div
      class="absolute bottom-0 left-0 right-0 p-2 bg-black/80 text-white opacity-50 text-sm md:text-base text-center"
    >
      {{ damageEntry.description }}
    </div>
  </div>

  <!-- Use VueEasyLightbox with detail_paths -->
  <VueEasyLightbox
    v-if="damageEntry.details"
    :visible="lightboxVisible"
    :imgs="lightboxImages"
    :index="0"
    :rotate-disabled="true"
    :zoom-scale="0.5"
    :min-zoom="0.5"
    :loop="true"
    @hide="lightboxVisible = false"
  />
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
