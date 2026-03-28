import type { AquariumPlant, FishCatalogItem } from "./schema";

export type ScrapeEvent<T> =
  | { type: "progress"; purpose: string }
  | { type: "complete"; data: T[] }
  | { type: "error"; message: string };

const MOCK_PLANTS: AquariumPlant[] = [
  {
    plant_name: "Java Fern",
    size: "15–30 cm",
    price: "$6.00",
    colour: "Dark Green",
    image_url: "/test/test_fish.jpg",
    description: "Hardy low-light plant that attaches to driftwood or rocks.",
    living_requirements: "Low to medium light, no CO2 needed",
  },
  {
    plant_name: "Amazon Sword",
    size: "20–50 cm",
    price: "$9.00",
    colour: "Bright Green",
    image_url: "/test/test_fish.jpg",
    description: "Classic background plant with broad, sword-shaped leaves.",
    living_requirements: "Medium to high light, nutrient-rich substrate",
  },
  {
    plant_name: "Anubias Nana",
    size: "5–15 cm",
    price: "$7.50",
    colour: "Deep Green",
    image_url: "/test/test_fish.jpg",
    description: "Slow-growing dwarf plant ideal for foreground or mid-ground.",
    living_requirements: "Low to medium light, tie to hardscape",
  },
  {
    plant_name: "Hornwort",
    size: "10–60 cm",
    price: "$4.00",
    colour: "Bright Green",
    image_url: "/test/test_fish.jpg",
    description: "Fast-growing stem plant that floats or roots in substrate.",
    living_requirements: "Low to high light, tolerates hard water",
  },
];

const MOCK_FISH: FishCatalogItem[] = [
  {
    breed_name: "Guo",
    size: "5–7 cm",
    price: "$8.00",
    colour: "Blue / Red",
    image_url: "/test/test_fish.jpg",
    description: "Vibrant Siamese fighting fish with flowing fins.",
    living_requirements: "pH 6.5–7.5, 24–28 °C, solitary",
  },
  {
    breed_name: "Neon Tetra",
    size: "2–3 cm",
    price: "$3.00",
    colour: "Blue / Red",
    image_url: "/test/test_fish.jpg",
    description: "Popular schooling fish with a vivid neon stripe.",
    living_requirements: "pH 6.0–7.0, 20–26 °C, groups of 6+",
  },
  {
    breed_name: "Clownfish",
    size: "8–11 cm",
    price: "$18.00",
    colour: "Orange / White",
    image_url: "/test/test_fish.jpg",
    description: "Iconic reef fish known for living among anemones.",
    living_requirements: "Saltwater, 24–27 °C, reef tank",
  },
  {
    breed_name: "Discus",
    size: "12–15 cm",
    price: "$45.00",
    colour: "Mixed",
    image_url: "/test/test_fish.jpg",
    description: "The king of the aquarium — striking disc-shaped body.",
    living_requirements: "pH 6.0–7.0, 28–32 °C, soft water",
  },
  {
    breed_name: "Corydoras Catfish",
    size: "3–5 cm",
    price: "$5.00",
    colour: "Silver / Black",
    image_url: "/test/test_fish.jpg",
    description: "Peaceful bottom-dweller and natural tank cleaner.",
    living_requirements: "pH 7.0–7.8, 22–26 °C, sandy substrate",
  },
  {
    breed_name: "Guppy",
    size: "3–6 cm",
    price: "$2.50",
    colour: "Multicolour",
    image_url: "/test/test_fish.jpg",
    description: "Hardy and colourful beginner fish.",
    living_requirements: "pH 7.0–8.5, 22–28 °C, tolerant",
  },
];

export async function* scrapeAquariumPlants(): AsyncGenerator<
  ScrapeEvent<AquariumPlant>
> {
  yield { type: "progress", purpose: "Loading plant catalog..." };
  await new Promise((r) => setTimeout(r, 400));
  yield { type: "progress", purpose: "Parsing plant listings..." };
  await new Promise((r) => setTimeout(r, 400));
  yield { type: "complete", data: MOCK_PLANTS };
}

export async function* scrapeFishCatalog(): AsyncGenerator<
  ScrapeEvent<FishCatalogItem>
> {
  yield { type: "progress", purpose: "Loading fish catalog..." };
  await new Promise((r) => setTimeout(r, 400));
  yield { type: "progress", purpose: "Parsing fish listings..." };
  await new Promise((r) => setTimeout(r, 400));
  yield { type: "complete", data: MOCK_FISH };
}
