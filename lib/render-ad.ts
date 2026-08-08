// lib/render-ad.ts
import sharp from "sharp";
import { readFileSync } from "fs";
import { join } from "path";
import { fontStyleHints } from "@/lib/ad-options";

const MAX_DIMENSIONS: Record<string, { maxWidth: number; maxHeight: number }> = {
  feed: { maxWidth: 1080, maxHeight: 1350 },
  story: { maxWidth: 1080, maxHeight: 1920 },
  reel: { maxWidth: 1080, maxHeight: 1920 },
};

// --- שלב 1: שינוי גודל תמונת קלט (לפני שליחה ל-AI), בלי לגעת בלוגו ---

export async function resizePhotoForAd({
  photoBuffer,
  format,
}: {
  photoBuffer: Buffer;
  format: string;
}): Promise<Buffer> {
  const { maxWidth, maxHeight } = MAX_DIMENSIONS[format] ?? MAX_DIMENSIONS.feed;
  return sharp(photoBuffer)
    .resize(maxWidth, maxHeight, { fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();
}

// --- שלב 2: הטמעת טקסט עברי אמיתי מעל התמונה שחזרה מ-AI ---

const FONT_FILES: Record<string, string> = {
  Rubik: "Rubik-Bold.ttf",
  Assistant: "Assistant-SemiBold.ttf",
  "IBM Plex Sans Hebrew": "IBMPlexSansHebrew-Regular.ttf",
};

function loadFontBase64(fontFamily: string): { base64: string; cssName: string } {
  const fileName = FONT_FILES[fontFamily] ?? FONT_FILES.Rubik;
  const filePath = join(process.cwd(), "assets", "fonts", fileName);
  const base64 = readFileSync(filePath).toString("base64");
  return { base64, cssName: fontFamily };
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function overlayTextOnImage({
  imageBuffer,
  headline,
  subheadline,
  fontFamily,
}: {
  imageBuffer: Buffer;
  headline: string;
  subheadline: string;
  fontFamily: string;
}): Promise<Buffer> {
  const meta = await sharp(imageBuffer).metadata();
  const width = meta.width ?? 1080;
  const height = meta.height ?? 1080;

  const { base64, cssName } = loadFontBase64(fontFamily);

  const headlineSize = Math.round(width * 0.06);
  const subheadlineSize = Math.round(width * 0.032);
  const padding = Math.round(width * 0.06);
  const gradientHeight = Math.round(height * 0.32);

  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: "${cssName}";
        src: url(data:font/ttf;base64,${base64}) format("truetype");
      }
      .headline {
        font-family: "${cssName}";
        font-weight: 700;
        font-size: ${headlineSize}px;
        fill: #ffffff;
      }
      .subheadline {
        font-family: "${cssName}";
        font-weight: 400;
        font-size: ${subheadlineSize}px;
        fill: #ffffff;
        opacity: 0.9;
      }
    </style>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.75" />
    </linearGradient>
  </defs>

  <rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#fade)" />

  <text
    x="${width - padding}"
    y="${height - padding - subheadlineSize - 12}"
    text-anchor="end"
    direction="rtl"
    class="headline"
  >${escapeXml(headline)}</text>

  <text
    x="${width - padding}"
    y="${height - padding}"
    text-anchor="end"
    direction="rtl"
    class="subheadline"
  >${escapeXml(subheadline)}</text>
</svg>`;

  return sharp(imageBuffer)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

export { fontStyleHints };