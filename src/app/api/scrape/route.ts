import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type {
  ApiError,
  ApiSuccess,
  AquariumPlant,
  FishCatalogItem,
} from "./schema";
import { scrapeAquariumPlants, scrapeFishCatalog } from "./scrape";

const QuerySchema = z.object({
  type: z.enum(["plants", "fish"]),
});

export async function GET(
  request: NextRequest,
): Promise<
  NextResponse<
    ApiSuccess<AquariumPlant[]> | ApiSuccess<FishCatalogItem[]> | ApiError
  >
> {
  const { searchParams } = new URL(request.url);
  const query = QuerySchema.safeParse({ type: searchParams.get("type") });

  if (!query.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_QUERY",
          message: 'Query param "type" must be "plants" or "fish".',
        },
      },
      { status: 400 },
    );
  }

  try {
    if (query.data.type === "plants") {
      const data = await scrapeAquariumPlants();
      return NextResponse.json({ success: true, data });
    } else {
      const data = await scrapeFishCatalog();
      return NextResponse.json({ success: true, data });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown scrape error";
    console.error("[scrape] Handler error:", message);
    return NextResponse.json(
      { success: false, error: { code: "SCRAPE_ERROR", message } },
      { status: 502 },
    );
  }
}
