// lib/ad-options.ts

export type DesignStyle =
  | "auto"
  | "modern_minimal"
  | "luxury"
  | "bold_vibrant"
  | "editorial"
  | "organic"
  | "dark_premium"
  | "elegant"
  | "corporate"
  | "playful"
  | "retro"
  | "scandinavian"
  | "cinematic";

export type CreativeAngle =
  | "auto"
  | "product_focus"
  | "lifestyle"
  | "offer_first"
  | "storytelling"
  | "seasonal";

export const designStyleOptions: { value: DesignStyle; label: string }[] = [
  { value: "auto", label: "אוטומטי (מותאם לתחום)" },
  { value: "modern_minimal", label: "מודרני מינימלי" },
  { value: "luxury", label: "יוקרתי" },
  { value: "bold_vibrant", label: "נועז וצבעוני" },
  { value: "editorial", label: "עיתונאי" },
  { value: "organic", label: "אורגני וחם" },
  { value: "dark_premium", label: "כהה ופרימיום" },
  { value: "elegant", label: "אלגנטי" },
  { value: "corporate", label: "עסקי" },
  { value: "playful", label: "משחקי" },
  { value: "retro", label: "וינטג'" },
  { value: "scandinavian", label: "סקנדינבי" },
  { value: "cinematic", label: "קולנועי" },
];

export const creativeAngleOptions: { value: CreativeAngle; label: string }[] = [
  { value: "auto", label: "אוטומטי" },
  { value: "product_focus", label: "מיקוד במוצר" },
  { value: "lifestyle", label: "אורח חיים/אווירה" },
  { value: "offer_first", label: "מבצע בחזית" },
  { value: "storytelling", label: "סיפור/נרטיב" },
  { value: "seasonal", label: "עונתי/אירוע" },
];

export const designStyleDescriptions: Record<string, string> = {
  modern_minimal: "Modern Minimal: clean lines, lots of white/negative space, understated elegance, restrained color use",
  luxury: "Luxury: rich deep tones, refined gold/metallic accents used sparingly, premium feel",
  bold_vibrant: "Bold & Vibrant: energetic, high contrast, confident use of color, dynamic feel — but still clean",
  editorial: "Editorial: magazine-cover aesthetic, sophisticated composition, fashion/lifestyle photography feel",
  organic: "Organic & Warm: earthy tones, cozy and inviting, natural textures, handcrafted warmth",
  dark_premium: "Dark Premium: deep dark background tones, moody dramatic lighting, exclusive/premium aesthetic",
  elegant: "Elegant: soft refined palette, graceful composition, delicate and sophisticated",
  corporate: "Corporate: clean professional B2B aesthetic, trustworthy and polished, structured layout",
  playful: "Playful: friendly and fun, approachable, slightly bouncy energy",
  retro: "Retro/Vintage: nostalgic color grading, classic composition, warm vintage character",
  scandinavian: "Scandinavian: light, airy, minimal, natural materials feel, calm and functional",
  cinematic: "Cinematic: dramatic lighting, movie-poster quality composition, epic mood",
};

export const creativeAngleDescriptions: Record<string, string> = {
  product_focus: "Product Focus: the product/subject itself is the hero, minimal distraction around it",
  lifestyle: "Lifestyle: emphasize the mood, setting, and feeling of the experience over the product itself",
  offer_first: "Offer First: composition should feel energetic and promotional, drawing attention to value",
  storytelling: "Storytelling: composition suggests a moment/narrative, more candid and less staged",
  seasonal: "Seasonal: composition reflects the relevant season/occasion mood",
};

export const fontStyleHints: Record<string, string> = {
  Rubik: "bold, geometric, modern sans-serif character",
  Assistant: "clean, soft, friendly sans-serif with rounded feel",
  "IBM Plex Sans Hebrew": "technical, precise, professional sans-serif",
};