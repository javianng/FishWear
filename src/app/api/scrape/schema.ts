import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod schemas — source of truth for TypeScript types and runtime validation
// ---------------------------------------------------------------------------

export const AquariumPlantSchema = z.object({
  plant_name: z.string(),
  size: z.string().optional(),
  price: z.string().optional(),
  colour: z.string().optional(),
  image_url: z.string().optional(),
  description: z.string().optional(),
  living_requirements: z.string().optional(),
});

export const FishCatalogItemSchema = z.object({
  breed_name: z.string().optional(),
  size: z.string().optional(),
  price: z.string().optional(),
  colour: z.string().optional(),
  image_url: z.string().optional(),
  description: z.string().optional(),
  living_requirements: z.string().optional(),
});

export type AquariumPlant = z.infer<typeof AquariumPlantSchema>;
export type FishCatalogItem = z.infer<typeof FishCatalogItemSchema>;

// ---------------------------------------------------------------------------
// API response types
// ---------------------------------------------------------------------------

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = {
  success: false;
  error: { code: string; message: string };
};
