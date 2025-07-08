// Define shared types and constants for the application

export interface DamageDetail {
  path: string // URL to the image
  description: string // Description/title for the image
}

export interface DamageEntry {
  id: string // Document ID from Firestore
  path: string // URL to the image (either blob URL or static path)
  description: string
  x: number // X position (0-100%)
  y: number // Y position (0-100%)
  side: 'front' | 'back' | 'left' | 'right' | 'top' // Enforce valid side values
  details: DamageDetail[] // Array of detail images with their descriptions
  createdAt: Date // When the entry was created
  updatedAt: Date // When the entry was last updated
  order: number // Sort order
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
