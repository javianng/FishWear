#!/usr/bin/env node
/**
 * Text-only pipeline: read scrape JSON → build catalog copy for each item (no image_link)
 * → gpt-4o-mini writes one detailed image prompt → gpt-image-1 generates one PNG.
 *
 *   export OPENAI_API_KEY="sk-..."
 *   npm run generate:from-descriptions
 *
 *   node scripts/generate-aquarium-from-descriptions.mjs --json ./sample_scrape_output.json --out ./out.png --max-items 5
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const CHAT_MODEL = "gpt-4o-mini";
const IMAGE_MODEL = "gpt-image-1";
const DEFAULT_MAX_ITEMS = 5;

/** Standard tank L × W × H (cm) — fish scale vs this volume. */
const TANK_L = 51;
const TANK_W = 25;
const TANK_H = 30;

function loadDotEnv() {
  const envPath = path.join(repoRoot, ".env");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function parseArgs(argv) {
  let outPath = path.join(repoRoot, "aquarium-from-descriptions.png");
  let jsonPath = path.join(repoRoot, "sample_scrape_output.json");
  let maxItems = DEFAULT_MAX_ITEMS;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--out" && argv[i + 1]) outPath = path.resolve(argv[++i]);
    else if (argv[i] === "--json" && argv[i + 1])
      jsonPath = path.resolve(argv[++i]);
    else if (argv[i] === "--max-items" && argv[i + 1])
      maxItems = Math.max(1, parseInt(argv[++i], 10) || DEFAULT_MAX_ITEMS);
  }
  return { outPath, jsonPath, maxItems };
}

/**
 * Flatten fish_list then driftwood_list; each row becomes one text block for the LLM.
 * @param {unknown} data
 * @param {number} maxItems
 */
function collectDescriptionItems(data, maxItems) {
  const fishList = Array.isArray(data?.fish_list) ? data.fish_list : [];
  const driftList = Array.isArray(data?.driftwood_list)
    ? data.driftwood_list
    : [];

  /** @type {{ label: string, text: string }[]} */
  const rows = [];

  for (const item of fishList) {
    if (rows.length >= maxItems) break;
    const text = formatItemBlock(item, "Fish");
    if (text) rows.push({ label: "fish", text });
  }
  for (const item of driftList) {
    if (rows.length >= maxItems) break;
    const text = formatItemBlock(item, "Hardscape / decor");
    if (text) rows.push({ label: "driftwood", text });
  }

  return rows;
}

function parseCount(raw) {
  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 1) {
    return Math.min(100, Math.floor(raw));
  }
  if (typeof raw === "string" && raw.length > 0) {
    const n = parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 1) return Math.min(100, n);
  }
  return 1;
}

function formatItemBlock(item, kindLabel) {
  if (!item || typeof item !== "object") return "";
  const name = typeof item.name === "string" ? item.name : "";
  const size = typeof item.size === "string" ? item.size : "";
  const colour = typeof item.colour === "string" ? item.colour : "";
  const desc = typeof item.description === "string" ? item.description : "";
  const count = parseCount(item.count);
  const sizeLine =
    size.length > 0
      ? kindLabel === "Fish"
        ? `Body length (scale vs ${TANK_L}×${TANK_W}×${TANK_H} cm tank): ${size}`
        : `Size / dimensions: ${size}`
      : "";
  const parts = [
    `${kindLabel}: ${name || "(unnamed)"}`,
    `Quantity to show in the final image: ${count}`,
    sizeLine,
    colour && `Colour / pattern: ${colour}`,
    desc && `Notes: ${desc}`,
  ].filter(Boolean);
  return parts.join("\n");
}

function stripCodeFences(s) {
  let t = s.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "");
  }
  return t.trim();
}

async function imageResponseToBase64(response) {
  const row = response.data?.[0];
  if (!row) return undefined;
  if (row.b64_json) return row.b64_json;
  if (row.url) {
    const r = await fetch(row.url);
    if (!r.ok) return undefined;
    return Buffer.from(await r.arrayBuffer()).toString("base64");
  }
  return undefined;
}

async function main() {
  loadDotEnv();
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.error(
      "Set OPENAI_API_KEY in the environment or in .env at the repo root.",
    );
    process.exit(1);
  }

  const { outPath, jsonPath, maxItems } = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(jsonPath)) {
    console.error(`Missing JSON file: ${jsonPath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const items = collectDescriptionItems(data, maxItems);
  if (items.length === 0) {
    console.error(
      "No catalog items found (need fish_list and/or driftwood_list with name/description fields).",
    );
    process.exit(1);
  }

  const catalogText = items
    .map((it, i) => `--- Item ${i + 1} ---\n${it.text}`)
    .join("\n\n");

  console.error(`Using ${items.length} description block(s) (max ${maxItems}).`);

  const client = new OpenAI({ apiKey: key });

  console.error(`Chat: ${CHAT_MODEL} → image prompt…`);
  const chat = await client.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: "system",
        content:
          `You write prompts for photorealistic aquarium images. Output only the final prompt text: no markdown, no title, no bullet list wrapper. The tank is approximately ${TANK_L} cm × ${TANK_W} cm × ${TANK_H} cm (L×W×H). Fish must appear small relative to that volume — use each item's body length to keep realistic scale (tiny fish vs tank height), never oversized. The camera must show the entire aquarium — full glass tank visible in frame (all edges), not an underwater-only crop. For multiple fish, vary swimming direction and facing (left, right, three-quarter angles) so they look natural.`,
      },
      {
        role: "user",
        content: `Below are ${items.length} aquarium catalog items (fish and/or hardscape). Standard aquarium: ${TANK_L} cm long × ${TANK_W} cm wide × ${TANK_H} cm tall. Each item includes quantity and (for fish) body length — use body length to scale fish so they look small inside this tank, not giant. The final image must show exactly the listed counts. Write one detailed image-generation prompt that places everything together in the same tank. Require the full rectangular tank to be visible in the shot. Describe varied fish poses and headings. Mention substrate, clear glass, water, and that it must look like one real photo — not a collage.

${catalogText}`,
      },
    ],
    max_tokens: 900,
  });

  const rawPrompt = chat.choices[0]?.message?.content?.trim();
  if (!rawPrompt) {
    console.error("Chat completion returned no text.");
    process.exit(1);
  }

  const imagePrompt =
    stripCodeFences(rawPrompt) +
    `\n\nFraming: entire aquarium visible from the front (complete glass tank, all edges). Tank ~${TANK_L}×${TANK_W}×${TANK_H} cm. Fish must be small relative to tank height per catalog body lengths — not macro-sized.`;

  console.error("--- Image prompt (preview) ---");
  console.error(imagePrompt.slice(0, 600) + (imagePrompt.length > 600 ? "…" : ""));
  console.error("--- End preview ---");

  console.error(`Image: ${IMAGE_MODEL}…`);
  const img = await client.images.generate({
    model: IMAGE_MODEL,
    prompt: imagePrompt,
  });

  const b64 = await imageResponseToBase64(img);
  if (!b64) {
    console.error("No image in API response.");
    process.exit(1);
  }

  fs.writeFileSync(outPath, Buffer.from(b64, "base64"));
  console.error(`Wrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
