// Define shared types and constants for the application

export interface DetailPath {
  src: string // URL to the image
  title: string // Description/title for the image
}

export interface DamageEntry {
  path: string // URL to the image (either blob URL or static path)
  description: string
  x: number // X position (0-100%)
  y: number // Y position (0-100%)
  side: string // 'front', 'back', 'left', 'right'
  detail_paths: DetailPath[] // Array of detail images with their descriptions
}

// Shared constants for car sides
export const CAR_SIDES = [
  { value: "front", label: "Front" },
  { value: "back", label: "Back" },
  { value: "left", label: "Left Side" },
  { value: "right", label: "Right Side" },
  { value: "top", label: "Top" },
]

// Shared constants for car models
export const CAR_MODELS = {
  zoe: "Zoe",
  kangoo: "Kangoo",
  kona: "Kona",
}

// Helper function to generate schematic path
export function getSchematicPath(carModel: string, side: string): string {
  // Validate inputs
  if (!carModel || !side) {
    console.warn("Invalid car model or side provided to getSchematicPath", {
      carModel,
      side,
    })
    return "" // Return empty string or a default image path
  }

  // Clean up the model and side to ensure valid path segments
  const cleanModel = carModel.toLowerCase().trim()
  const cleanSide = side.toLowerCase().trim()

  // Only return a path if both model and side are valid
  if (cleanModel && cleanSide) {
    return `/car_line_drawings/${cleanModel}_${cleanSide}.png`
  }

  return "" // Fallback to empty string if validation fails
}

// Helper function to get damage images for a specific car model
export function getDamageImagesForModel(model: string): string[] {
  if (model === "kangoo") {
    return [
      "/damages/kangoo/signal-2025-05-18-194106.jpeg",
      "/damages/kangoo/signal-2025-05-18-194231.jpeg",
      "/damages/kangoo/signal-2025-05-18-194245.jpeg",
    ]
  } else if (model === "kona") {
    return [
      // Add Kona images when available
      "/damages/kona/placeholder.jpeg",
    ]
  } else {
    // Default to Zoe images
    return [
      "/damages/zoe/signal-2025-05-18-193248.jpeg",
      "/damages/zoe/signal-2025-05-18-193335.jpeg",
      "/damages/zoe/signal-2025-05-18-193348.jpeg",
      "/damages/zoe/signal-2025-05-18-193431.jpeg",
      "/damages/zoe/signal-2025-05-18-193504.jpeg",
      "/damages/zoe/signal-2025-05-18-193556.jpeg",
      "/damages/zoe/signal-2025-05-18-193635.jpeg",
      "/damages/zoe/signal-2025-05-18-193703.jpeg",
      "/damages/zoe/signal-2025-05-18-193723.jpeg",
      "/damages/zoe/signal-2025-05-18-193734.jpeg",
      "/damages/zoe/signal-2025-05-18-193750.jpeg",
      "/damages/zoe/signal-2025-05-18-193851.jpeg",
      "/damages/zoe/signal-2025-05-18-193929.jpeg",
    ]
  }
}
