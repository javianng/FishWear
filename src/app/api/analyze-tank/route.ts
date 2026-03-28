import { NextResponse, type NextRequest } from "next/server";
import { type ApiError, type ApiSuccess } from "./schema";

export const maxDuration = 200;

export async function POST(
  _request: NextRequest,
): Promise<NextResponse<ApiSuccess | ApiError>> {
  // Simulated tank analysis — returns mock data without calling Gemini
  await new Promise((r) => setTimeout(r, 500));

  return NextResponse.json({
    success: true,
    data: {
      fishSpecies: [
        {
          scientificName: "Betta splendens",
          commonName: "Siamese Fighting Fish",
          count: 1,
          confidenceLevel: "high" as const,
          notes: "Vibrant blue and red colouration, flowing fins",
        },
        {
          scientificName: "Paracheirodon innesi",
          commonName: "Neon Tetra",
          count: 6,
          confidenceLevel: "high" as const,
          notes: "Schooling near mid-tank",
        },
        {
          scientificName: "Corydoras sp.",
          commonName: "Corydoras Catfish",
          count: 3,
          confidenceLevel: "medium" as const,
          notes: "Bottom-dwelling, species unclear",
        },
      ],
      ornaments: [
        {
          type: "driftwood",
          description: "Large branching piece anchoring the left side",
          count: 1,
        },
        {
          type: "live plant",
          description: "Dense Java Fern cluster attached to driftwood",
          count: 2,
        },
        {
          type: "rock",
          description: "Dark volcanic rock grouping on right substrate",
          count: 3,
        },
      ],
      tankNotes:
        "Well-planted community tank with clear water. Substrate appears to be fine dark gravel.",
    },
  });
}
