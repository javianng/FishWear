"use client";

import { useRef, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { scrapeAquariumPlants, scrapeFishCatalog } from './api/scrape/scrape';

type IdeatedItem = {
  id: number;
  imageUrl: string;
  description: string;
  category: "fish" | "ornament";
};

export type AquariumPlant = {
  url: string;
  name: string;
  size: string;
  habitat: string;
  lighting: string;
  placement: string;
  care_level: string;
  growth_style: string;
  general_terms: string;
  aesthetic_terms: string;
  functional_terms: string;
};

export type Fish = {
  name: string;
  size: string;
  colour: string;
  image_link: string;
  description: string;
  living_requirements: string;
};

const MOCK_ITEMS: IdeatedItem[] = [
  {
    id: 1,
    imageUrl: "https://picsum.photos/seed/fish1/120/120",
    description: "Betta Splendens",
    category: "fish",
  },
  {
    id: 2,
    imageUrl: "https://picsum.photos/seed/fish2/120/120",
    description: "Clownfish",
    category: "fish",
  },
  {
    id: 3,
    imageUrl: "https://picsum.photos/seed/fish3/120/120",
    description: "Discus Fish",
    category: "fish",
  },
  {
    id: 4,
    imageUrl: "https://picsum.photos/seed/orn1/120/120",
    description: "Coral Reef Ornament",
    category: "ornament",
  },
  {
    id: 5,
    imageUrl: "https://picsum.photos/seed/fish4/120/120",
    description: "Goldfish",
    category: "fish",
  },
  {
    id: 6,
    imageUrl: "https://picsum.photos/seed/orn2/120/120",
    description: "Driftwood Ornament",
    category: "ornament",
  },
];

export default function HomePage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [plants, setPlants] = useState<AquariumPlant[]>([]);
  const [fish, setFish] = useState<Fish[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedItems = MOCK_ITEMS.filter((i) => selectedIds.has(i.id));

  function handleFile(file: File) {
    if (uploadedImage) URL.revokeObjectURL(uploadedImage);
    setUploadedImage(URL.createObjectURL(file));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleSearch() {
    setHasSearched(true);
    setSelectedIds(new Set());
    setHasGenerated(false);

    try {
      // Call your scraping functions
      const scrapedPlants = await scrapeAquariumPlants();
      const scrapedFish = await scrapeFishCatalog();

      // Store results in state
      setPlants(scrapedPlants);
      setFish(scrapedFish);

      console.log('Scraped Plants:', scrapedPlants);
      console.log('Scraped Fish:', scrapedFish);

      setHasGenerated(true);
    } catch (err) {
      console.error('Error scraping:', err);
    }
  }

  function toggleItem(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <main className="min-h-screen space-y-8 p-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <img
          src="/logo_cropped.png"
          alt="FishWear logo"
          className="h-10 w-auto"
        />
        <span className="text-xl font-semibold">Fishwear</span>
      </header>

      <Separator />

      {/* Workbench */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Workbench</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left: Input */}
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm font-medium">Input</p>

            {/* Drop zone */}
            <div
              className={cn(
                "flex h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors",
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadedImage ? (
                <img
                  src={uploadedImage}
                  alt="Uploaded reference"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <p className="text-sm">Drag & drop or click to upload</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />

            <Textarea
              placeholder="Describe what you're looking for..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />

            <Button className="w-full" onClick={handleSearch}>
              Search
            </Button>
          </div>

          {/* Middle: Ideated Items */}
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm font-medium">
              Ideated Items
            </p>

            {!hasSearched ? (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground text-sm">
                  Results will appear after searching.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {MOCK_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="hover:bg-muted/50 flex cursor-pointer flex-col gap-2 rounded-lg border p-2 transition-colors"
                    onClick={() => toggleItem(item.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>

                    <img
                      src={item.imageUrl}
                      alt={item.description}
                      className="h-20 w-full rounded object-cover"
                    />
                    <p className="text-xs font-medium">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Selected Items */}
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground text-sm font-medium">
              Selected Items
            </p>

            <div className="flex-1 space-y-2">
              {selectedItems.length === 0 ? (
                <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
                  <p className="text-muted-foreground text-sm">
                    No items selected yet.
                  </p>
                </div>
              ) : (
                selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border p-2"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.description}
                      className="h-10 w-10 rounded object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium">{item.description}</p>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button
              className="w-full"
              onClick={() => setHasGenerated(true)}
              disabled={selectedItems.length === 0}
            >
              Generate
            </Button>
          </div>
        </div>
      </section>

      {/* Final Output + Items List */}
      {hasGenerated && (
        <>
          <Separator />

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Your FishWear Design</h2>
            <div className="overflow-hidden rounded-xl">
              <img
                src="https://picsum.photos/seed/fishwear-hero/1200/675"
                alt="Generated FishWear design"
                className="aspect-video w-full object-cover"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Items Used</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {selectedItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="space-y-3 p-3">
                    <img
                      src={item.imageUrl}
                      alt={item.description}
                      className="h-32 w-full rounded object-cover"
                    />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{item.description}</p>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs"
                      asChild
                    >
                      <a href="#" target="_blank" rel="noreferrer">
                        Buy now →
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
