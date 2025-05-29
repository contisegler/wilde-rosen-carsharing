export interface DamageEntry {
  path: string;      // URL to the image (either blob URL or static path)
  description: string;
  x: number;         // X position (0-100%)
  y: number;         // Y position (0-100%)
  side: string;      // 'front', 'back', 'left', 'right'
}
