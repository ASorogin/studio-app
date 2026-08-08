// lib/ai-image.ts
import OpenAI from "openai";
import { toFile } from "openai/uploads";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SIZE_BY_FORMAT: Record<string, "1024x1024" | "1024x1536"> = {
  feed: "1024x1024",
  story: "1024x1536",
  reel: "1024x1536",
};

export async function generateAdImageWithAI({
  imageBuffers,
  prompt,
  format,
}: {
  imageBuffers: Buffer[];
  prompt: string;
  format: string;
}): Promise<Buffer> {
  const size = SIZE_BY_FORMAT[format] ?? "1024x1024";

  const imageFiles = await Promise.all(
    imageBuffers.map((buf, i) => toFile(buf, `input-${i}.png`, { type: "image/png" }))
  );

  const response = await openai.images.edit({
    model: "gpt-image-2",
    image: imageFiles,
    prompt,
    size,
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("לא התקבלה תמונה מהמודל");
  }

  return Buffer.from(b64, "base64");
}