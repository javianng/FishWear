"use client";

import { ArrowRight, Camera, Fish } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

type IdeatedItem = {
  id: number;
  imageUrl: string;
  description: string;
  category: "fish" | "ornament";
  productUrl: string;
};

const MOCK_ITEMS: IdeatedItem[] = [
  // Aquarium Plants
  {
    id: 1,
    imageUrl: "/mock/1_plant.png",
    description: "Vibrant Red Root Floaters",
    category: "ornament",
    productUrl:
      "https://fishlist.com.sg/cdn/shop/files/image_370c2002-6c20-496c-9f06-40318bd711ec.jpg?height=1280&v=1760002330",
  },
  {
    id: 2,
    imageUrl: "/mock/2_plant.jpg",
    description: "Vibrant Green Micranthemum Umbrosum",
    category: "ornament",
    productUrl:
      "https://fishlist.com.sg/cdn/shop/files/micranthemum-umbrosum_2a7e613c-2136-46a8-b748-bd685e3f0dfe.jpg?height=940&v=1760098261",
  },
  {
    id: 3,
    imageUrl: "mock/3_plant.png",
    description: "Live Nymphoides Indica Water Snowflake",
    category: "ornament",
    productUrl:
      "https://fishlist.com.sg/cdn/shop/files/image_dd212fda-5dcf-430c-a622-a1079e556391.jpg?height=1280&v=1760002249",
  },

  // Fish
  {
    id: 4,
    imageUrl: "/mock/1_fish.png",
    description: "Assorted Guppy 3cm",
    category: "fish",
    productUrl:
      "https://fishlist.com.sg/cdn/shop/files/maxresdefault_3_jpg.webp?v=1757124102",
  },
  {
    id: 5,
    imageUrl: "/mock/2_fish.png",
    description: "Cardinal Tetra",
    category: "fish",
    productUrl:
      "https://fishlist.com.sg/cdn/shop/files/licensed-image.jpg?crop=center&height=430&v=1756732321&width=430",
  },
  {
    id: 6,
    imageUrl: "/mock/3_fish.png",
    description: "Luminous colour Tetra 3cm",
    category: "fish",
    productUrl:
      "https://fishlist.com.sg/cdn/shop/files/MIXGLOWTETRA.jpg?v=1707898680",
  },
];

export default function HomePage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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
    setSelectedIds(new Set());
    setHasGenerated(false);

    const toastId = toast.loading("chatgpt analyzing image");

    await new Promise((r) => setTimeout(r, 500));
    toast.loading("image understood", { id: toastId });

    await new Promise((r) => setTimeout(r, 100));
    toast.loading("tiny fish scraping now", { id: toastId });

    await new Promise((r) => setTimeout(r, 3000));
    toast.dismiss(toastId);

    setHasSearched(true);
  }

  function handleGenerate() {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
    }, 500);
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
      {/* Demo Banner */}
      <div className="fixed top-0 right-0 left-0 z-50 bg-amber-500/90 px-4 py-2 text-center text-sm font-medium text-black backdrop-blur-sm">
        Demo mode - all results are simulated. No API calls are made.
      </div>
      <div className="h-1" />

      {/* Header */}
      <header className="flex items-center gap-3">
        <img
          src="/logo_cropped.png"
          alt="FishWear logo"
          className="h-10 w-auto"
        />
        <span className="text-xl font-semibold">FishWear</span>
      </header>

      <Separator />

      {/* Hero */}

      <section className="relative flex h-160 w-full items-center justify-center overflow-hidden bg-black">
        <video
          src="/smoke_fish.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute z-0 min-h-full w-auto max-w-none min-w-full object-cover opacity-60"
        />
        <div className="absolute z-10 h-full w-full bg-linear-to-b from-black/60 via-transparent to-black" />

        {/* Content Container */}
        <div className="relative z-20 container mx-auto px-4 text-center">
          <div className="mb-8 flex justify-center">
            <Badge
              variant="secondary"
              className="border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-sm font-medium text-cyan-400 backdrop-blur-md"
            >
              <Fish className="mr-2 h-3 w-3 animate-pulse" />
              No more mid tanks
            </Badge>
          </div>

          <h1 className="mb-6 scroll-m-20 text-6xl font-black text-white uppercase italic lg:text-9xl">
            We help you <br />
            <span className="bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              fish fishes.
            </span>
          </h1>

          <div className="mx-auto mb-10">
            <p className="text-xl text-white">
              Browsing 50 websites for driftwood is a skip. <br />
              Drop a photo,{" "}
              <span className="text-cyan-500 italic">visualize the drip</span>,
              and build the ultimate vibe for your finned friends.
            </p>
            <p className="mt-4 text-3xl text-white uppercase">
              We are Fishwear.
            </p>
          </div>

          {/* Action Buttons - Using shadcn Buttons */}
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              onClick={() =>
                document
                  .getElementById("workbench")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Camera className="mr-1 h-5 w-5" />
              Visualize My Tank
            </Button>

            <Button variant="secondary" size="lg">
              Browse the Drop
              <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Bottom subtle detail */}
        <div className="absolute bottom-8 left-8 hidden lg:block">
          <p className="text-[10px] tracking-[0.5em] text-zinc-500 uppercase [writing-mode:vertical-lr]">
            Est. 2026 // Aquatic Drip
          </p>
        </div>
      </section>

      <Separator />

      {/* Workbench */}
      <section id="workbench">
        <h2 className="mb-4 text-lg font-semibold">Workbench</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left: Input */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold tracking-widest text-cyan-500 uppercase">
                Step 1
              </p>
              <p className="font-semibold">Upload Your Tank</p>
              <p className="text-muted-foreground text-xs">
                Drop a photo of your dream tank and/or describe the vibe you're
                going for. Hit Search to find matching fish and plants.
              </p>
            </div>

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
            <div>
              <p className="text-xs font-bold tracking-widest text-cyan-500 uppercase">
                Step 2
              </p>
              <p className="font-semibold">Pick Your Items</p>
              <p className="text-muted-foreground text-xs">
                Browse the suggested fish and plants. Check the ones you want to
                include in your tank build.
              </p>
            </div>

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
            <div>
              <p className="text-xs font-bold tracking-widest text-cyan-500 uppercase">
                Step 3
              </p>
              <p className="font-semibold">Generate Your Build</p>
              <p className="text-muted-foreground text-xs">
                Review your selected items, then hit Generate to visualize your
                dream tank setup.
              </p>
            </div>

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
              onClick={handleGenerate}
              disabled={selectedItems.length === 0 || isGenerating}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate"
              )}
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
                src="/mock/generated.jpg"
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
                      <a
                        href={item.productUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
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
      <footer className="text-muted-foreground border-t pt-6 pb-1 text-center text-xs">
        © {new Date().getFullYear()} FishWear. All rights reserved.
      </footer>
    </main>
  );
}
