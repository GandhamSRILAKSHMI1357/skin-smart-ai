import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

async function callAI(messages: unknown[]) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, messages }),
  });
  if (res.status === 429) throw new Error("Rate limit reached. Try again in a moment.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Usage.");
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);
  const json = (await res.json()) as { choices: { message: { content: string } }[] };
  return json.choices[0]?.message?.content ?? "";
}

const SYSTEM_ROUTINE = `You are Lumen, an expert AI esthetician. Build personalized skincare routines.
Return concise, friendly markdown with clear AM and PM sections, each as a numbered list of steps.
For each step give: product type, key ingredients to look for, and a one-line "why".
End with a short "Watch-outs" section. Avoid medical claims. Use simple language.`;

const SYSTEM_ANALYZE = `You are Lumen, an expert AI esthetician analyzing a selfie.
Identify visible skin concerns (e.g. dryness, redness, texture, dark spots, breakouts, dullness).
Be kind and non-judgmental. Return markdown with sections:
**Observations** (3-5 bullets), **Likely concerns**, **Suggested focus** (3 actionable tips).
Never diagnose medical conditions; suggest seeing a dermatologist for anything concerning.`;

const SYSTEM_CHAT = `You are Lumen, a warm, knowledgeable AI esthetician.
Answer skincare questions clearly and briefly (under 180 words).
Suggest ingredient types, not specific brands unless asked. No medical diagnoses.`;

export const getRoutine = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      skinType: z.string().min(1).max(40),
      concerns: z.string().max(500),
      age: z.string().max(10).optional(),
      budget: z.string().max(40).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const user = `Skin type: ${data.skinType}
Main concerns: ${data.concerns || "general maintenance"}
Age range: ${data.age || "unspecified"}
Budget: ${data.budget || "any"}

Build my routine.`;
    const content = await callAI([
      { role: "system", content: SYSTEM_ROUTINE },
      { role: "user", content: user },
    ]);
    return { content };
  });

export const analyzeSelfie = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      imageDataUrl: z.string().startsWith("data:image/").max(8_000_000),
      notes: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const content = await callAI([
      { role: "system", content: SYSTEM_ANALYZE },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: data.notes
              ? `Please analyze this selfie. Notes from user: ${data.notes}`
              : "Please analyze this selfie.",
          },
          { type: "image_url", image_url: { url: data.imageDataUrl } },
        ],
      },
    ]);
    return { content };
  });

export const chatWithLumen = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      messages: z
        .array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string().min(1).max(4000),
          }),
        )
        .min(1)
        .max(40),
    }),
  )
  .handler(async ({ data }) => {
    const content = await callAI([
      { role: "system", content: SYSTEM_CHAT },
      ...data.messages,
    ]);
    return { content };
  });
