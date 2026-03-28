import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod schemas — source of truth for TypeScript types and runtime validation
// ---------------------------------------------------------------------------

export const AquariumPlantSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
  general_terms: z.string().optional(),
  placement: z.string().optional(),
  growth_style: z.string().optional(),
  care_level: z.string().optional(),
  lighting: z.string().optional(),
  habitat: z.string().optional(),
  aesthetic_terms: z.string().optional(),
  functional_terms: z.string().optional(),
  size: z.string().optional(),
});

export const FishCatalogItemSchema = z.object({
  name: z.string().optional(),
  image_link: z.string().url().optional(),
  size: z.string().optional(),
  colour: z.string().optional(),
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
