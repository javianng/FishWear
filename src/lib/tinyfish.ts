import { TinyFish } from "@tiny-fish/sdk";
import { env } from "~/env.js";

export const tinyfish = new TinyFish({ apiKey: env.TINYFISH_API_KEY });
