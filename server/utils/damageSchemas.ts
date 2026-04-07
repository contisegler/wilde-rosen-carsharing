import { z } from "zod";

// Valid car sides
const carSides = ['front', 'back', 'left', 'right', 'top'] as const;

// Car side schema
export const carSideSchema = z.enum(carSides);

// Damage detail schema
export const damageDetailSchema = z.object({
    description: z.string(),
    imagePath: z.string(),
});

// Base damage fields
const baseDamageFields = {
    description: z.string().min(1, "Description is required"),
    imagePath: z.string().min(1, "Image path is required"),
    details: z.array(damageDetailSchema).default([]),
    side: carSideSchema,
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
};

// Schema for creating a new damage (POST)
export const createDamageSchema = z.object(baseDamageFields);

// Schema for full replacement (PUT)
export const replaceDamageSchema = z.object(baseDamageFields);

// Schema for partial update (PATCH)
export const updateDamageSchema = z.object({
    description: z.string().min(1).optional(),
    imagePath: z.string().min(1).optional(),
    details: z.array(damageDetailSchema).optional(),
    side: carSideSchema.optional(),
    x: z.number().min(0).max(100).optional(),
    y: z.number().min(0).max(100).optional(),
});

// Infer TypeScript types from schemas
export type CreateDamageInput = z.infer<typeof createDamageSchema>;
export type ReplaceDamageInput = z.infer<typeof replaceDamageSchema>;
export type UpdateDamageInput = z.infer<typeof updateDamageSchema>;
