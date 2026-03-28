import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod schemas — source of truth for TypeScript types and runtime validation
// ---------------------------------------------------------------------------

export const FishSpeciesSchema = z.object({
  scientificName: z.string(),
  commonName: z.string(),
  count: z.number().int().min(0),
  confidenceLevel: z.enum(["high", "medium", "low"]),
  notes: z.string().optional(),
});

export const OrnamentSchema = z.object({
  type: z.string(),
  description: z.string(),
  count: z.number().int().min(1),
});

export const TankAnalysisSchema = z.object({
  fishSpecies: z.array(FishSpeciesSchema),
  ornaments: z.array(OrnamentSchema),
  tankNotes: z.string().optional(),
});

export type TankAnalysis = z.infer<typeof TankAnalysisSchema>;
export type FishSpecies = z.infer<typeof FishSpeciesSchema>;
export type Ornament = z.infer<typeof OrnamentSchema>;

// ---------------------------------------------------------------------------
// Gemini responseSchema — manually transcribed to OpenAPI/Gemini SchemaType format.
// Passed to `responseSchema` in the API call to constrain model output to valid JSON.
// ---------------------------------------------------------------------------

export const geminiTankResponseSchema = {
  type: "object",
  properties: {
    fishSpecies: {
      type: "array",
      items: {
        type: "object",
        properties: {
          scientificName: { type: "string" },
          commonName: { type: "string" },
          count: { type: "integer" },
          confidenceLevel: {
            type: "string",
            enum: ["high", "medium", "low"],
          },
          notes: { type: "string" },
        },
        required: ["scientificName", "commonName", "count", "confidenceLevel"],
      },
    },
    ornaments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          description: { type: "string" },
          count: { type: "integer" },
        },
        required: ["type", "description", "count"],
      },
    },
    tankNotes: { type: "string" },
  },
  required: ["fishSpecies", "ornaments"],
};

// ---------------------------------------------------------------------------
// API response types
// ---------------------------------------------------------------------------

export type ApiSuccess = { success: true; data: TankAnalysis };
export type ApiError = {
  success: false;
  error: { code: string; message: string };
};
