// lib/render-ad.ts
import type { Business } from "@prisma/client";

export const FORMAT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  feed: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  reel: { width: 1080, height: 1920 },
};

export function buildAdHtml({
  photoUrl,
  headline,
  caption,
  business,
  width,
  height,
}: {
  photoUrl: string;
  headline: string;
  caption: string;
  business: Business;
  width: number;
  height: number;
}) {
  const badgeHtml = business.logoUrl
    ? `<img class="badge-logo" src="${business.logoUrl}" />`
    : `<div class="badge-text">${business.name}</div>`;

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@700;800&family=Assistant:wght@400;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${width}px;
    height: ${height}px;
    position: relative;
    overflow: hidden;
    font-family: 'Assistant', sans-serif;
  }
  img.bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .overlay {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    padding: 48px 40px 56px;
    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0) 100%);
    color: white;
    text-align: right;
  }
  .headline {
    font-family: 'Rubik', sans-serif;
    font-weight: 800;
    font-size: 56px;
    line-height: 1.15;
    margin-bottom: 16px;
  }
  .caption {
    font-size: 30px;
    line-height: 1.4;
    opacity: 0.92;
  }
  .badge-logo {
    position: absolute;
    top: 32px;
    right: 32px;
    width: 96px;
    height: 96px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid white;
    box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  }
  .badge-text {
    position: absolute;
    top: 32px;
    right: 32px;
    left: 32px;
    max-width: fit-content;
    margin-right: auto;
    background: ${business.colorPrimary};
    color: ${business.colorSecondary};
    font-family: 'Rubik', sans-serif;
    font-weight: 700;
    font-size: 26px;
    padding: 10px 20px;
    border-radius: 999px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
</head>
<body>
  <img class="bg" src="${photoUrl}" />
  ${badgeHtml}
  <div class="overlay">
    <div class="headline">${headline}</div>
    <div class="caption">${caption}</div>
  </div>
</body>
</html>`;
}