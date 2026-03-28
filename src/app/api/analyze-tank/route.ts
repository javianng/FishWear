import { NextResponse, type NextRequest } from "next/server";
import { gemini, TANK_ANALYSIS_MODEL } from "~/lib/gemini";
import {
  geminiTankResponseSchema,
  TankAnalysisSchema,
  type ApiError,
  type ApiSuccess,
} from "./schema";

export const maxDuration = 800;

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const ANALYSIS_PROMPT = `You are a fish tank expert. Analyze this photograph of a fish tank and identify:

1. All visible fish species — provide the scientific (binomial) name, common English name, an estimated count of individuals visible, and your confidence level (high/medium/low). If you cannot confidently identify a species to the species level, use the genus with "sp." (e.g., "Corydoras sp."). Include any relevant notes such as juvenile coloration or unusual markings. If you see no fish, return an empty array.

2. All visible tank ornaments and decorations — categorize each (e.g., driftwood, live plant, artificial plant, rock, cave, substrate, filter equipment, heater) and provide a brief visual description. If you see no ornaments, return an empty array.

Do not invent species or ornaments that are not clearly visible in the image.`;

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiSuccess | ApiError>> {
  // 1. Parse multipart form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_FORM_DATA",
          message: "Request must be multipart/form-data.",
        },
      },
      { status: 400 },
    );
  }

  // 2. Extract and validate the image field
  const imageField = formData.get("image");
  if (!(imageField instanceof File)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "MISSING_IMAGE",
          message: 'Form data must include an "image" field of type File.',
        },
      },
      { status: 400 },
    );
  }

  // 3. Validate MIME type
  if (!ALLOWED_MIME_TYPES.has(imageField.type)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_IMAGE_TYPE",
          message: `Unsupported image type: "${imageField.type}". Allowed: jpeg, png, webp, heic, heif.`,
        },
      },
      { status: 415 },
    );
  }

  // 4. Validate file size
  if (imageField.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "IMAGE_TOO_LARGE",
          message: `Image exceeds the 10MB limit. Received: ${(imageField.size / 1024 / 1024).toFixed(2)}MB.`,
        },
      },
      { status: 413 },
    );
  }

  // 5. Convert File to base64 for Gemini inline data
  const arrayBuffer = await imageField.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString("base64");

  // 6. Call Gemini Vision API with structured output
  let rawText: string;
  try {
    const result = await gemini.models.generateContent({
      model: TANK_ANALYSIS_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: imageField.type,
                data: base64Data,
              },
            },
            { text: ANALYSIS_PROMPT },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: geminiTankResponseSchema,
        temperature: 0.1,
      },
    });

    rawText = result.text ?? "";
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown Gemini API error";
    console.error("[analyze-tank] Gemini API error:", message);
    return NextResponse.json(
      { success: false, error: { code: "GEMINI_API_ERROR", message } },
      { status: 502 },
    );
  }

  // 7. Parse JSON response
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawText);
  } catch {
    console.error(
      "[analyze-tank] Failed to parse Gemini JSON response:",
      rawText,
    );
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_MODEL_RESPONSE",
          message: "Model did not return valid JSON.",
        },
      },
      { status: 502 },
    );
  }

  // 8. Validate response shape with Zod
  const validationResult = TankAnalysisSchema.safeParse(parsedJson);
  if (!validationResult.success) {
    console.error(
      "[analyze-tank] Zod validation failed:",
      validationResult.error.flatten(),
    );
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SCHEMA_VALIDATION_FAILED",
          message: "Model response did not match expected schema.",
        },
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true, data: validationResult.data });
}
