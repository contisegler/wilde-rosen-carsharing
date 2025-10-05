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
  order: number
  imagePath: string
  schematicPath: string
  sideIndex: number
}
