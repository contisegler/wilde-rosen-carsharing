<script setup lang="ts">
import type { Damage } from '~~/shared/types'
import { getDownloadURL, ref as storageRef } from 'firebase/storage'

interface Props {
  damage: Damage
  carId: string
}

const props = defineProps<Props>()

const user = useUser()
const canReportDamage = computed(() => user.userRoles?.damageReporter ?? false)

const numDetails = computed(() => props.damage.details?.length || 0)

// Add cache-busting timestamp to image URLs
const cacheBuster = computed(() => {
  const timestamp = props.damage.updatedAt?.getTime() || Date.now()
  return `?t=${timestamp}`
})

// Get Firebase Storage download URLs (with tokens)
const imageUrl = ref<string>()
const schematicUrl = ref<string>()
const detailImageUrls = ref<string[]>([])

// Only run on client side to avoid SSR issues
if (process.client) {
  onMounted(async () => {
    try {
      const storage = useFirebaseStorage()
      
      const imgRef = storageRef(storage, props.damage.imagePath)
      const imgDownloadUrl = await getDownloadURL(imgRef)
      imageUrl.value = `${imgDownloadUrl}${cacheBuster.value}`
      
      const schematicRef = storageRef(storage, props.damage.schematicPath)
      schematicUrl.value = await getDownloadURL(schematicRef)
      
      // Fetch detail image URLs for lightbox
      if (props.damage.details && props.damage.details.length > 0) {
        const detailUrls = await Promise.all(
          props.damage.details.map(async (detail) => {
            const detailRef = storageRef(storage, detail.imagePath)
            return await getDownloadURL(detailRef)
          })
        )
        detailImageUrls.value = detailUrls
      }
    } catch (error) {
      console.error('Error loading damage images:', error)
    }
  })
}

const lightboxImages = computed(() => 
  detailImageUrls.value.map((url, index) => ({
    src: url,
    title: `${index + 1}: ${props.damage.details?.[index]?.description || ''}`,
  }))
)

const lightboxVisible = ref(false)
const schematicLoaded = ref(false)
</script>

<template>
  <div
    class="relative group min-h-[210px]"
    :data-id="damage.id"
    :data-side="damage.side"
    :data-x="damage.x"
    :data-y="damage.y"
  >
    <!-- Main Damage Image -->
    <FirebaseNuxtImg
      v-if="imageUrl"
      :src="imageUrl"
      class="w-full max-w-full h-auto max-h-[600px] object-cover cursor-pointer transition-all duration-300 group-hover:brightness-90"
      :alt="`Auto Schaden: ${damage.description}`"
      sizes="sm:80vw md:70vw lg:736px"
      format="webp"
      :quality="70"
      loading="lazy"
      :modifiers="{ rotate: 'undefined' }"
      densities="1x 2x"
      @click="lightboxVisible = true"
    />

    <!-- Badge showing number of detail images -->
    <UBadge
      v-if="numDetails"
      class="absolute top-2 left-2 bg-black/80 text-white opacity-50"
      size="lg"
    >
      {{ numDetails }}
    </UBadge>

    <!-- Edit Button (top-right corner, for damage reporters only) -->
    <UButton
      v-if="canReportDamage"
      variant="soft"
      color="neutral"
      square
      class="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white shadow-md"
      icon="i-lucide-pencil"
      @click.stop="navigateTo(`/cars/${carId}/damages/${damage.id}/edit`)"
    />

    <!-- Schematic Overlay -->
    <div class="absolute top-2" :class="canReportDamage ? 'right-[60px]' : 'right-2'">
      <div class="relative">
        <FirebaseNuxtImg
          v-if="schematicUrl"
          :src="schematicUrl"
          class="opacity-70"
          :alt="`Schema für ${carId}; Seite: ${damage.side}`"
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
          :style="{ left: damage.x + '%', top: damage.y + '%' }"
        >
          X
        </div>
      </div>
    </div>

    <!-- Description overlaid on the image -->
    <div
      class="absolute bottom-0 left-0 right-0 p-2 bg-black/80 text-white opacity-50 text-sm md:text-base text-center"
    >
      {{ damage.description }}
    </div>
  </div>

  <!-- Use VueEasyLightbox with detail images -->
  <VueEasyLightbox
    v-if="damage.details && damage.details.length > 0"
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
