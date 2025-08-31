<script setup lang="ts">
  import { ref as storageRef, uploadBytes, getDownloadURL, listAll, getMetadata } from "firebase/storage"
  import { v4 as uuidv4 } from "uuid"

  interface Props {
    storagePath?: string
    allowUpload?: boolean
    allowBrowse?: boolean
    multiple?: boolean
    accept?: string
    placeholder?: string
  }

  interface CloudImage {
    name: string
    url: string
    fullPath: string
    size?: number
    timeCreated?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    storagePath: "images",
    allowUpload: true,
    allowBrowse: true,
    multiple: false,
    accept: "image/*",
    placeholder: "Bild aus Cloud Storage auswählen oder hochladen",
  })

  const emit = defineEmits<{
    "image-selected": [image: CloudImage]
    "images-selected": [images: CloudImage[]]
    "upload-complete": [image: CloudImage]
    "upload-error": [error: string]
  }>()

  const storage = useFirebaseStorage()
  const isLoading = ref(false)
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const showBrowser = ref(false)
  const availableImages = ref<CloudImage[]>([])
  const selectedImages = ref<CloudImage[]>([])
  const fileInput = ref<HTMLInputElement>()

  // Load available images from storage
  async function loadAvailableImages() {
    if (!props.allowBrowse) return

    try {
      isLoading.value = true
      const storageReference = storageRef(storage, props.storagePath)
      const result = await listAll(storageReference)

      const imagePromises = result.items.map(async item => {
        const url = await getDownloadURL(item)
        const metadata = await getMetadata(item)

        return {
          name: item.name,
          url,
          fullPath: item.fullPath,
          size: metadata.size,
          timeCreated: metadata.timeCreated,
        } as CloudImage
      })

      availableImages.value = await Promise.all(imagePromises)
    } catch (error) {
      console.error("Error loading images:", error)
      emit("upload-error", "Fehler beim Laden der Bilder")
    } finally {
      isLoading.value = false
    }
  }

  // Handle file upload
  async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement
    const files = target.files
    if (!files || files.length === 0) return

    try {
      isUploading.value = true
      uploadProgress.value = 0

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileName = `${file.name}_${uuidv4()}`
        const fileRef = storageRef(storage, `${props.storagePath}/${fileName}`)

        // Upload file
        await uploadBytes(fileRef, file)

        // Get download URL
        const url = await getDownloadURL(fileRef)

        const uploadedImage: CloudImage = {
          name: fileName,
          url,
          fullPath: fileRef.fullPath,
          size: file.size,
          timeCreated: new Date().toISOString(),
        }

        emit("upload-complete", uploadedImage)

        if (props.multiple) {
          selectedImages.value.push(uploadedImage)
        } else {
          selectedImages.value = [uploadedImage]
          emit("image-selected", uploadedImage)
        }

        uploadProgress.value = ((i + 1) / files.length) * 100
      }

      if (props.multiple && selectedImages.value.length > 0) {
        emit("images-selected", selectedImages.value)
      }

      // Refresh available images
      await loadAvailableImages()
    } catch (error) {
      console.error("Upload error:", error)
      emit("upload-error", "Fehler beim Hochladen")
    } finally {
      isUploading.value = false
      uploadProgress.value = 0
      if (fileInput.value) {
        fileInput.value.value = ""
      }
    }
  }

  // Select image from browser
  function selectImage(image: CloudImage) {
    if (props.multiple) {
      const index = selectedImages.value.findIndex(img => img.fullPath === image.fullPath)
      if (index > -1) {
        selectedImages.value.splice(index, 1)
      } else {
        selectedImages.value.push(image)
      }
      emit("images-selected", selectedImages.value)
    } else {
      selectedImages.value = [image]
      emit("image-selected", image)
      showBrowser.value = false
    }
  }

  // Check if image is selected
  function isImageSelected(image: CloudImage): boolean {
    return selectedImages.value.some(img => img.fullPath === image.fullPath)
  }

  // Open browser
  function openBrowser() {
    showBrowser.value = true
    loadAvailableImages()
  }

  // Trigger file input
  function triggerFileInput() {
    fileInput.value?.click()
  }

  // Format file size
  function formatFileSize(bytes?: number): string {
    if (!bytes) return ""
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Byte"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  // Format date
  function formatDate(dateString?: string): string {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("de-DE")
  }

  onMounted(() => {
    if (props.allowBrowse) {
      loadAvailableImages()
    }
  })
</script>

<template>
  <div class="space-y-4">
    <!-- Main Action Buttons -->
    <div class="flex gap-2 flex-wrap">
      <Button
        v-if="allowUpload"
        variant="outline"
        size="default"
        :disabled="isUploading"
        @click="triggerFileInput"
      >
        <LucideUpload class="w-4 h-4 mr-2" />
        {{ isUploading ? "Hochladen..." : "Hochladen" }}
      </Button>

      <Button
        v-if="allowBrowse"
        variant="outline"
        size="default"
        :disabled="isLoading"
        @click="openBrowser"
      >
        <LucideImages class="w-4 h-4 mr-2" />
        {{ isLoading ? "Laden..." : "Durchsuchen" }}
      </Button>
    </div>

    <!-- Upload Progress -->
    <div v-if="isUploading" class="w-full bg-gray-200 rounded-full h-2">
      <div
        class="bg-blue-600 h-2 rounded-full transition-all duration-300"
        :style="{ width: uploadProgress + '%' }"
      ></div>
    </div>

    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="hidden"
      @change="handleFileUpload"
    />

    <!-- Image Browser Modal -->
    <div
      v-if="showBrowser"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showBrowser = false"
    >
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div class="p-4 border-b flex justify-between items-center">
          <h3 class="text-lg font-semibold">Bild aus Cloud Storage auswählen</h3>
          <Button variant="ghost" size="sm" @click="showBrowser = false">
            <LucideX class="w-4 h-4" />
          </Button>
        </div>

        <div class="p-4 max-h-[60vh] overflow-y-auto">
          <div v-if="isLoading" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-2 text-gray-600">Bilder werden geladen...</p>
          </div>

          <div v-else-if="availableImages.length === 0" class="text-center py-8 text-gray-500">
            Keine Bilder gefunden
          </div>

          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              v-for="image in availableImages"
              :key="image.fullPath"
              class="relative group cursor-pointer"
              @click="selectImage(image)"
            >
              <FirebaseNuxtImg
                :src="image.url"
                :alt="image.name"
                class="w-full h-32 object-cover transition-all"
                :class="
                  isImageSelected(image)
                    ? 'ring-2 ring-blue-500'
                    : 'hover:ring-2 hover:ring-gray-300'
                "
                sizes="sm:150px md:200px"
                :quality="80"
                loading="lazy"
                :modifiers="{ rotate: null }"
              />

              <!-- Selection Indicator -->
              <div
                v-if="isImageSelected(image)"
                class="absolute top-2 right-2 bg-blue-500 text-white w-6 h-6 flex items-center justify-center"
              >
                <LucideCheck class="w-3 h-3" />
              </div>

              <!-- Image Info -->
              <div
                class="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2"
              >
                <div class="truncate font-medium">{{ image.name }}</div>
                <div class="flex justify-between text-gray-300">
                  <span>{{ formatFileSize(image.size) }}</span>
                  <span>{{ formatDate(image.timeCreated) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="multiple && selectedImages.length > 0" class="p-4 border-t bg-gray-50">
          <Button class="w-full" @click="showBrowser = false">
            {{ selectedImages.length }} Bild(er) ausgewählt
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* Additional custom styles if needed */
</style>
