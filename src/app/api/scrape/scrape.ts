import { tinyfish } from "~/lib/tinyfish";
import {
  AquariumPlantSchema,
  FishCatalogItemSchema,
  type AquariumPlant,
  type FishCatalogItem,
} from "./schema";

export type ScrapeEvent<T> =
  | { type: "progress"; purpose: string }
  | { type: "complete"; data: T[] }
  | { type: "error"; message: string };

/**
 * Scrape aquarium plants from fishlist.com.sg
 */
export async function* scrapeAquariumPlants(): AsyncGenerator<
  ScrapeEvent<AquariumPlant>
> {
  console.log("[scrape:plants] Calling tinyfish.agent.stream");
  const stream = await tinyfish.agent.stream({
    url: "https://fishlist.com.sg/collections/aquatic-plants",
    goal: 'Navigate to https://fishlist.com.sg/collections/aquatic-plants and browse the catalog to extract each plant\'s name, size, price, colour, image link, description, and living requirements (such as lighting, CO2, and placement). Return the collected information in a structured JSON format matching: { "size": "xxx", "price": "$00.00", "colour": "xxx", "image_url": "https://example.com", "plant_name": "xxx", "description": "xxx", "living_requirements": "xxx"}',
  });
  console.log("[scrape:plants] Stream acquired, iterating events");

  for await (const event of stream) {
    console.log("[scrape:plants] Raw event:", JSON.stringify(event));

    if (event.type === "PROGRESS") {
      yield { type: "progress", purpose: event.purpose };
    } else if (event.type === "COMPLETE") {
      console.log("[scrape:plants] COMPLETE status:", event.status);
      console.log(
        "[scrape:plants] COMPLETE result:",
        JSON.stringify(event.result),
      );

      if (event.status !== "COMPLETED" || event.result == null) {
        yield {
          type: "error",
          message: event.error?.message ?? "Agent did not complete",
        };
        return;
      }

      let items: unknown[];
      if (Array.isArray(event.result)) {
        items = event.result;
      } else if (typeof event.result === "object") {
        const firstArray = Object.values(
          event.result as Record<string, unknown>,
        ).find((v) => Array.isArray(v));
        items = (firstArray as unknown[]) ?? [event.result];
      } else {
        items = [];
      }

      console.log(
        `[scrape:plants] Raw items (${items.length}):`,
        JSON.stringify(items),
      );

      const data: AquariumPlant[] = [];
      for (const item of items) {
        const validation = AquariumPlantSchema.safeParse(item);
        if (validation.success) {
          data.push(validation.data);
        } else {
          console.warn(
            "[scrape:plants] Schema mismatch:",
            JSON.stringify(item),
          );
          console.warn(
            "[scrape:plants] Errors:",
            JSON.stringify(validation.error.flatten()),
          );
        }
      }
      console.log(`[scrape:plants] Validated items: ${data.length}`);
      yield { type: "complete", data };
    }
  }
}

/**
 * Scrape fish catalog from fishlist.com.sg
 */
export async function* scrapeFishCatalog(): AsyncGenerator<
  ScrapeEvent<FishCatalogItem>
> {
  console.log("[scrape:fish] Calling tinyfish.agent.stream");
  const stream = await tinyfish.agent.stream({
    url: "https://fishlist.com.sg/collections/fish",
    goal: 'Navigate to https://fishlist.com.sg/collections/fish and browse the species catalog to extract each fish\'s breed name, size, price, colour, image link, description, and living requirements. Return the collected information in a structured JSON format matching: { "size": "0cm", "price": "$00.00", "colour": "xxx", "image_url": "https://example.com", "breed_name": "xxx", "description": "xxx", "living_requirements": "xxx"}',
  });
  console.log("[scrape:fish] Stream acquired, iterating events");

  for await (const event of stream) {
    console.log("[scrape:fish] Raw event:", JSON.stringify(event));

    if (event.type === "PROGRESS") {
      yield { type: "progress", purpose: event.purpose };
    } else if (event.type === "COMPLETE") {
      console.log("[scrape:fish] COMPLETE status:", event.status);
      console.log(
        "[scrape:fish] COMPLETE result:",
        JSON.stringify(event.result),
      );

      if (event.status !== "COMPLETED" || event.result == null) {
        yield {
          type: "error",
          message: event.error?.message ?? "Agent did not complete",
        };
        return;
      }

      let items: unknown[];
      if (Array.isArray(event.result)) {
        items = event.result;
      } else if (typeof event.result === "object") {
        const firstArray = Object.values(
          event.result as Record<string, unknown>,
        ).find((v) => Array.isArray(v));
        items = (firstArray as unknown[]) ?? [event.result];
      } else {
        items = [];
      }

      console.log(
        `[scrape:fish] Raw items (${items.length}):`,
        JSON.stringify(items),
      );

      const data: FishCatalogItem[] = [];
      for (const item of items) {
        const validation = FishCatalogItemSchema.safeParse(item);
        if (validation.success) {
          data.push(validation.data);
        } else {
          console.warn("[scrape:fish] Schema mismatch:", JSON.stringify(item));
          console.warn(
            "[scrape:fish] Errors:",
            JSON.stringify(validation.error.flatten()),
          );
        }
      }
      console.log(`[scrape:fish] Validated items: ${data.length}`);
      yield { type: "complete", data };
    }
  }
}
