/**
 * Composable for handling image modal state
 * This is a simplified version that uses the more focused composables
 */

export function useImageHandling() {
  // State for modal/lightbox
  const showModal = ref(false)
  const currentImagePath = ref('')

  // Open modal with specific image
  function openModal(imagePath: string) {
    currentImagePath.value = imagePath
    showModal.value = true
  }

  // Close modal
  function closeModal() {
    showModal.value = false
  }

  return {
    // State
    showModal,
    currentImagePath,
    
    // Methods
    openModal,
    closeModal
  }
}
