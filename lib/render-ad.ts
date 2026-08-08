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

// הערכה שמרנית לרוחב תו עברי מודגש — עדיף להעריך יתר על המידה (ולקבל
// שבירה מוקדמת מדי) מאשר לחסר (ולקבל טקסט שבורח מחוץ לתמונה).
const CHAR_WIDTH_RATIO = 0.72;

function estimateLineWidth(line: string, fontSizePx: number): number {
  return line.length * fontSizePx * CHAR_WIDTH_RATIO;
}

function wrapText(text: string, maxWidthPx: number, fontSizePx: number): string[] {
  const words = text.split(" ").filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? currentLine + " " + word : word;
    if (estimateLineWidth(candidate, fontSizePx) > maxWidthPx && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// שובר לשורות, ואם גם אחרי שבירה שורה כלשהי עדיין רחבה מדי (למשל מילה
// בודדת ארוכה) — מקטין את גודל הפונט בהדרגה (עד למינימום סביר) ומנסה שוב.
function wrapAndFit(
  text: string,
  maxWidthPx: number,
  initialFontSize: number,
  minFontSize: number
): { lines: string[]; fontSize: number } {
  let fontSize = initialFontSize;
  let lines = wrapText(text, maxWidthPx, fontSize);

  let attempts = 0;
  while (
    lines.some((line) => estimateLineWidth(line, fontSize) > maxWidthPx) &&
    fontSize > minFontSize &&
    attempts < 6
  ) {
    fontSize = Math.round(fontSize * 0.88);
    lines = wrapText(text, maxWidthPx, fontSize);
    attempts++;
  }

  return { lines, fontSize };
}

export type TextArea = "top" | "bottom" | "left" | "right";

export async function overlayTextOnImage({
  imageBuffer,
  headline,
  subheadline,
  fontFamily,
  textArea = "bottom",
}: {
  imageBuffer: Buffer;
  headline: string;
  subheadline: string;
  fontFamily: string;
  textArea?: TextArea;
}): Promise<Buffer> {
  const meta = await sharp(imageBuffer).metadata();
  const width = meta.width ?? 1080;
  const height = meta.height ?? 1080;

  const { base64, cssName } = loadFontBase64(fontFamily);

  const padding = Math.round(width * 0.06);
  const isVertical = textArea === "left" || textArea === "right";
  const maxTextWidth = (isVertical ? Math.round(width * 0.45) : width) - padding * 2;

  const initialHeadlineSize = Math.round(width * 0.06);
  const initialSubheadlineSize = Math.round(width * 0.032);
  const minHeadlineSize = Math.round(width * 0.03);
  const minSubheadlineSize = Math.round(width * 0.02);

  const { lines: headlineLines, fontSize: headlineSize } = wrapAndFit(
    escapeXml(headline),
    maxTextWidth,
    initialHeadlineSize,
    minHeadlineSize
  );
  const { lines: subheadlineLines, fontSize: subheadlineSize } = wrapAndFit(
    escapeXml(subheadline),
    maxTextWidth,
    initialSubheadlineSize,
    minSubheadlineSize
  );

  const lineGap = Math.round(headlineSize * 0.25);
  const headlineBlockHeight = headlineLines.length * (headlineSize + lineGap);
  const subheadlineBlockHeight = subheadlineLines.length * (subheadlineSize + lineGap * 0.6);
  const totalTextHeight = headlineBlockHeight + subheadlineBlockHeight + 12;

  let gradientRect: string;
  let textX: number;
  let textAnchor: string;
  let blockStartY: number;

  if (textArea === "top") {
    const gradientHeight = Math.max(Math.round(height * 0.3), totalTextHeight + padding * 2);
    gradientRect = `<rect x="0" y="0" width="${width}" height="${gradientHeight}" fill="url(#fadeTop)" />`;
    textX = width - padding;
    textAnchor = "end";
    blockStartY = padding + headlineSize;
  } else if (textArea === "left") {
    const gradientWidth = Math.round(width * 0.45);
    gradientRect = `<rect x="0" y="0" width="${gradientWidth}" height="${height}" fill="url(#fadeLeft)" />`;
    textX = padding;
    textAnchor = "start";
    blockStartY = Math.round((height - totalTextHeight) / 2) + headlineSize;
  } else if (textArea === "right") {
    const gradientWidth = Math.round(width * 0.45);
    gradientRect = `<rect x="${width - gradientWidth}" y="0" width="${gradientWidth}" height="${height}" fill="url(#fadeRight)" />`;
    textX = width - padding;
    textAnchor = "end";
    blockStartY = Math.round((height - totalTextHeight) / 2) + headlineSize;
  } else {
    const gradientHeight = Math.max(Math.round(height * 0.32), totalTextHeight + padding * 2);
    gradientRect = `<rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#fadeBottom)" />`;
    textX = width - padding;
    textAnchor = "end";
    blockStartY = height - padding - totalTextHeight + headlineSize;
  }

  const headlineTextElements = headlineLines
    .map((line, i) => {
      const y = blockStartY + i * (headlineSize + lineGap);
      return `<text x="${textX}" y="${y}" text-anchor="${textAnchor}" class="headline">${line}</text>`;
    })
    .join("\n");

  const subheadlineStartY = blockStartY + headlineBlockHeight + subheadlineSize * 0.3;
  const subheadlineTextElements = subheadlineLines
    .map((line, i) => {
      const y = subheadlineStartY + i * (subheadlineSize + lineGap * 0.6);
      return `<text x="${textX}" y="${y}" text-anchor="${textAnchor}" class="subheadline">${line}</text>`;
    })
    .join("\n");

  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: "${cssName}";
        src: url(data:font/ttf;base64,${base64}) format("truetype");
      }
      .headline { font-family: "${cssName}"; font-weight: 700; font-size: ${headlineSize}px; fill: #ffffff; }
      .subheadline { font-family: "${cssName}"; font-weight: 400; font-size: ${subheadlineSize}px; fill: #ffffff; opacity: 0.9; }
    </style>
    <linearGradient id="fadeBottom" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.75" />
    </linearGradient>
    <linearGradient id="fadeTop" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.75" />
    </linearGradient>
    <linearGradient id="fadeLeft" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.75" />
    </linearGradient>
    <linearGradient id="fadeRight" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.75" />
    </linearGradient>
  </defs>

  ${gradientRect}
  ${headlineTextElements}
  ${subheadlineTextElements}
</svg>`;

  return sharp(imageBuffer)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

export { fontStyleHints };