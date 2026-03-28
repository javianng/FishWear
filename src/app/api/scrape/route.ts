import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { scrapeAquariumPlants, scrapeFishCatalog } from "./scrape";

export const maxDuration = 800;

const QuerySchema = z.object({
  type: z.enum(["plants", "fish"]),
});

export async function GET(request: NextRequest) {
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

  const scrapeType = query.data.type;
  console.log(`[scrape] GET /api/scrape?type=${scrapeType}`);

  const encoder = new TextEncoder();
  const generator =
    scrapeType === "plants" ? scrapeAquariumPlants() : scrapeFishCatalog();

  const stream = new ReadableStream({
    async start(controller) {
      console.log(`[scrape:${scrapeType}] Stream started`);
      try {
        for await (const event of generator) {
          console.log(`[scrape:${scrapeType}] Event:`, JSON.stringify(event));
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
          );
        }
        console.log(`[scrape:${scrapeType}] Generator exhausted`);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown scrape error";
        console.error(`[scrape:${scrapeType}] Handler error:`, message);
        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message })}\n\n`,
            ),
          );
        } catch {
          // Client disconnected before we could send the error event.
        }
      } finally {
        console.log(`[scrape:${scrapeType}] Stream closed`);
        try {
          controller.close();
        } catch {
          // Already closed or cancelled.
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
