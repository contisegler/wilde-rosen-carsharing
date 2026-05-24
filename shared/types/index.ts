export interface WithId<T> {
    id: string;
    payload: T;
}

export interface UserData {
    id: string;
    email: string;
    displayName: string;
}

export interface FirebaseEmulatorConfig {
    auth: boolean;
    firestore: boolean;
}

export type CarSide = "front" | "back" | "left" | "right" | "top";

export interface Car {
    id: string;
    title: string;
}

export interface DamageDetail {
    description: string;
    imagePath: string;
}

export interface Damage {
    id: string;
    description: string;
    imagePath: string;
    schematicPath: string;
    sideIndex: number;
    details: DamageDetail[];
    createdAt: Date;
    side: CarSide;
    x: number;
    y: number;
    updatedAt: Date;  
    isArchive?: boolean;
}

export interface LogEntry {
    id: string;
    carId: string;
    userId: string;
    userName: string;
    startTime: Date;
    endTime?: Date;
    startKm: number;
    endKm?: number;
    notes?: string;
}

export interface StorageFile {
  name: string
  url: string
  fullPath: string
  size?: number
  timeCreated?: string
}

export interface DamageDetailFormEntry {
  image: File | StorageFile | null
  description: string
}
