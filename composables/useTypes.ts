// Define shared types and constants for the application

export interface CarData {
  id: string
  title: string
}

export interface DamageDetail {
  description: string
  imageUrl: string
}


export type CarSide = "front" | "back" | "left" | "right" | "top"


export interface DamageEntry {
  id: string
  description: string
  x: number
  y: number
  side: CarSide
  details: DamageDetail[]
  order: number
  imageUrl: string
  schematicUrl: string
}