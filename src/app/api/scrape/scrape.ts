import { env } from "~/env.js"; // path to your env file
import { TinyFish } from '@tiny-fish/sdk';

// Now you can access your API key
const client = new TinyFish({ apiKey: env.TINYFISH_API_KEY });

/**
 * Scrape aquarium plants from fishlist.com.sg
 */
export async function scrapeAquariumPlants() {
  const url = 'https://fishlist.com.sg/plants';
  const stream = await client.agent.stream({
    url,
    goal: `Navigate to the aquarium plants catalog page, locate each plant entry,
           and extract the plant name, URL, and the specified attributes:
           general_terms, placement, growth_style, care_level, lighting,
           habitat, aesthetic_terms, functional_terms, and size.
           Return the collected data as a structured list.`
  });

  const results: any[] = [];

  for await (const event of stream) {
    if (event && typeof event === 'object' && 'message' in event) {
      const message = (event as any).message;
      if (message && typeof message === 'object' && 'content' in message) {
        try {
          const parsed = JSON.parse((message as any).content);
          results.push(parsed);
        } catch {
          // ignore partial or non-JSON chunks
        }
      }
    }
  }

  return results;
}

/**
 * Scrape fish catalog from fishlist.com.sg
 */
export async function scrapeFishCatalog() {
  const url = 'https://fishlist.com.sg';
  const stream = await client.agent.stream({
    url,
    goal: `Navigate to the fish catalog or species pages, extract each fish's
           image link, size, colour, description, and living requirements.
           Return the collected information in a structured JSON format.`
  });

  const results: any[] = [];

  for await (const event of stream) {
    if (event && typeof event === 'object' && 'message' in event) {
      const message = (event as any).message;
      if (message && typeof message === 'object' && 'content' in message) {
        try {
          const parsed = JSON.parse((message as any).content);
          results.push(parsed);
        } catch {
          // ignore partial or non-JSON chunks
        }
      }
    }
  }

  return results;
}