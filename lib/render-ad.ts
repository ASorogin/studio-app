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