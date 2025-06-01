/**
 * Composable for image zoom and pan functionality
 * Provides state and methods for zooming and panning images
 */

export function useImageZoomPan() {
  // State for zoom and pan
  const imageScale = ref(1)
  const translateX = ref(0)
  const translateY = ref(0)
  const isDragging = ref(false)
  const lastPosition = ref({ x: 0, y: 0 })

  // Zoom functions
  function zoomIn() {
    imageScale.value = Math.min(imageScale.value + 0.1, 3)
  }

  function zoomOut() {
    imageScale.value = Math.max(imageScale.value - 0.1, 0.5)
  }

  // Mouse event handlers for panning
  function handleMouseDown(event: MouseEvent) {
    isDragging.value = true
    lastPosition.value = { x: event.clientX, y: event.clientY }
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isDragging.value) return

    const deltaX = event.clientX - lastPosition.value.x
    const deltaY = event.clientY - lastPosition.value.y
    
    translateX.value += deltaX / imageScale.value
    translateY.value += deltaY / imageScale.value
    
    lastPosition.value = { x: event.clientX, y: event.clientY }
  }

  function handleMouseUp() {
    isDragging.value = false
  }

  // Touch event handlers for mobile devices
  function handleTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      isDragging.value = true
      lastPosition.value = { 
        x: event.touches[0].clientX, 
        y: event.touches[0].clientY 
      }
    }
  }

  function handleTouchMove(event: TouchEvent) {
    if (!isDragging.value || event.touches.length !== 1) return
    
    const touch = event.touches[0]
    const deltaX = touch.clientX - lastPosition.value.x
    const deltaY = touch.clientY - lastPosition.value.y
    
    translateX.value += deltaX / imageScale.value
    translateY.value += deltaY / imageScale.value
    
    lastPosition.value = { x: touch.clientX, y: touch.clientY }
    
    // Prevent default to avoid scrolling the page
    event.preventDefault()
  }

  // Handle click on backdrop (close if not on image)
  function handleBackdropClick(event: MouseEvent) {
    // Only close if clicking directly on the backdrop, not on the content
    if (event.target === event.currentTarget) {
      // Reset zoom and position
      imageScale.value = 1
      translateX.value = 0
      translateY.value = 0
    }
  }

  return {
    // State
    imageScale,
    translateX,
    translateY,
    isDragging,
    
    // Methods
    zoomIn,
    zoomOut,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleBackdropClick
  }
}
