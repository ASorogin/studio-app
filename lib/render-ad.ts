// lib/render-ad.ts
import sharp from "sharp";

const MAX_DIMENSIONS: Record<string, { maxWidth: number; maxHeight: number }> = {
  feed: { maxWidth: 1080, maxHeight: 1350 },
  story: { maxWidth: 1080, maxHeight: 1920 },
  reel: { maxWidth: 1080, maxHeight: 1920 },
};

async function makeCircularLogo(buffer: Buffer, size: number): Promise<Buffer> {
  const circleMask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
  );
  const resizedLogo = await sharp(buffer).resize(size, size, { fit: "cover" }).toBuffer();
  return sharp(resizedLogo).composite([{ input: circleMask, blend: "dest-in" }]).png().toBuffer();
}

export async function renderAdImage({
  photoBuffer,
  logoBuffer,
  format,
}: {
  photoBuffer: Buffer;
  logoBuffer: Buffer | null;
  format: string;
}): Promise<Buffer> {
  const { maxWidth, maxHeight } = MAX_DIMENSIONS[format] ?? MAX_DIMENSIONS.feed;

  // fit: "inside" משנה גודל כך שהתמונה לא חורגת מהמגבלות, תוך שמירה
  // מלאה על יחס הגובה-רוחב המקורי — בלי חיתוך, בלי עיוות.
  // withoutEnlargement מונע הגדלה של תמונה שכבר קטנה מהמגבלה.
  const resizedPhoto = sharp(photoBuffer).resize(maxWidth, maxHeight, {
    fit: "inside",
    withoutEnlargement: true,
  });

  const meta = await resizedPhoto.metadata();
  const photoWidth = meta.width ?? maxWidth;

  if (!logoBuffer) {
    return resizedPhoto.png().toBuffer();
  }

  const badgeSize = Math.max(60, Math.min(140, Math.round(photoWidth * 0.14)));
  const margin = Math.round(badgeSize * 0.35);
  const circularLogo = await makeCircularLogo(logoBuffer, badgeSize);

  return resizedPhoto
    .composite([{ input: circularLogo, top: margin, left: photoWidth - badgeSize - margin }])
    .png()
    .toBuffer();
}

export function buildFallbackImagePrompt({
  business,
  headline,
  subheadline,
  hasLogo,
}: {
  business: { colorPrimary: string; colorSecondary: string; fontFamily: string };
  headline: string;
  subheadline: string;
  hasLogo: boolean;
}): string {
  const fontStyleHints: Record<string, string> = {
    Rubik: "bold, geometric, modern sans-serif typography with strong character",
    Assistant: "clean, soft, friendly sans-serif typography with rounded feel",
    "IBM Plex Sans Hebrew": "technical, precise, professional sans-serif typography",
  };
  const fontStyleHint = fontStyleHints[business.fontFamily] ?? "clean modern sans-serif typography";

  return (
    "Take the provided image exactly as it is and keep it completely intact. " +
    "Do not modify, replace, or recreate any part of the image content. " +
    (hasLogo
      ? "The logo (a small white circle) in the upper corner must remain untouched in its exact position. "
      : "") +
    "Add a dark gradient overlay on the bottom third of the image, fading from transparent at two-thirds height to solid dark at the bottom. " +
    `Over this gradient, place the headline '${headline}' in large, bold, ${fontStyleHint}, in white color with a subtle text shadow for readability. ` +
    `Below the headline, place the subtitle '${subheadline}' in smaller white text with the same subtle shadow effect. ` +
    "Ensure no text overlaps with the logo area. " +
    `Use the primary color ${business.colorPrimary} and secondary color ${business.colorSecondary} only as decorative supporting elements (such as a thin line accent or subtle border), never as primary text color. ` +
    "The final design should be professional and unified, with the image remaining the focal point. " +
    "No additional text, tags, watermarks, or graphic elements beyond what is specified."
  );
}