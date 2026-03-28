import { GoogleGenAI } from "@google/genai";
import { env } from "~/env.js";

// Module-level singleton — one instance per cold start in serverless environments
export const gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export const TANK_ANALYSIS_MODEL = "gemini-3-flash-preview";
