// Define shared types and constants for the application

export interface CarData {
  id: string
  title: string
}

export interface DamageDetail {
  id: string
  description: string
  path: string
}

export type CarSide = "front" | "back" | "left" | "right" | "top"

export interface DamageEntryBase {
  id: string
  path: string
  description: string
  x: number
  y: number
  side: CarSide
  details: DamageDetail[]
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface DamageEntry extends DamageEntryBase {
  imageUrl: string
  schematicUrl: string
}