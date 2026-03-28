import { tinyfish } from "~/lib/tinyfish";
import {
  AquariumPlantSchema,
  FishCatalogItemSchema,
  type AquariumPlant,
  type FishCatalogItem,
} from "./schema";

interface StreamMessageEvent {
  message: { content: string };
}

function isMessageEvent(event: unknown): event is StreamMessageEvent {
  if (typeof event !== "object" || event === null || !("message" in event)) {
    return false;
  }
  const msg = (event as Record<string, unknown>).message;
  return (
    typeof msg === "object" && msg !== null && "content" in (msg as object)
  );
}

/**
 * Scrape aquarium plants from fishlist.com.sg
 */
export async function scrapeAquariumPlants(): Promise<AquariumPlant[]> {
  const url = "https://fishlist.com.sg/plants";
  const stream = await tinyfish.agent.stream({
    url,
    goal: `Navigate to the aquarium plants catalog page, locate each plant entry,
           and extract the plant name, URL, and the specified attributes:
           general_terms, placement, growth_style, care_level, lighting,
           habitat, aesthetic_terms, functional_terms, and size.
           Return the collected data as a structured list.`,
  });

  const results: AquariumPlant[] = [];

  try {
    for await (const event of stream) {
      if (!isMessageEvent(event)) continue;
      try {
        const parsed: unknown = JSON.parse(event.message.content);
        const validation = AquariumPlantSchema.safeParse(parsed);
        if (validation.success) {
          results.push(validation.data);
        } else {
          console.warn(
            "[scrape] Plant schema mismatch:",
            validation.error.flatten(),
          );
        }
      } catch {
        console.warn(
          "[scrape] Failed to parse plant chunk:",
          event.message.content,
        );
      }
    }
  } catch (err) {
    console.error(
      "[scrape] Stream error (plants):",
      err instanceof Error ? err.message : err,
    );
    throw err;
  }

  return results;
}

/**
 * Scrape fish catalog from fishlist.com.sg
 */
export async function scrapeFishCatalog(): Promise<FishCatalogItem[]> {
  const url = "https://fishlist.com.sg";
  const stream = await tinyfish.agent.stream({
    url,
    goal: `Navigate to the fish catalog or species pages, extract each fish's
           image link, size, colour, description, and living requirements.
           Return the collected information in a structured JSON format.`,
  });

  const results: FishCatalogItem[] = [];

  try {
    for await (const event of stream) {
      if (!isMessageEvent(event)) continue;
      try {
        const parsed: unknown = JSON.parse(event.message.content);
        const validation = FishCatalogItemSchema.safeParse(parsed);
        if (validation.success) {
          results.push(validation.data);
        } else {
          console.warn(
            "[scrape] Fish schema mismatch:",
            validation.error.flatten(),
          );
        }
      } catch {
        console.warn(
          "[scrape] Failed to parse fish chunk:",
          event.message.content,
        );
      }
    }
  } catch (err) {
    console.error(
      "[scrape] Stream error (fish):",
      err instanceof Error ? err.message : err,
    );
    throw err;
  }

  return results;
}
