// Define shared types and constants for the application

export type CarSide = "front" | "back" | "left" | "right" | "top"

export interface CarData {
  id: string
  title: string
}

export interface DamageDetail {
  description: string
  imagePath: string
}

export interface DamageEntry {
  id: string
  description: string
  x: number
  y: number
  side: CarSide
  details: DamageDetail[]
  imagePath: string
  schematicPath: string
  sideIndex: number
  createdAt?: Date
  updatedAt?: Date
}

export interface CloudImage {
  name: string
  url: string
  fullPath: string
  size?: number
  timeCreated?: string
}

// Form state for damage details (used in UI)
export interface DamageDetailFormEntry {
  image: CloudImage | null
  description: string
}
