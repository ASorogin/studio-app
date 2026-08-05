// app/api/ads/generate-image-prompt/route.ts
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const MODEL = "claude-sonnet-5";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) {
    return NextResponse.json({ error: "לא נמצא משתמש" }, { status: 401 });
  }

  const { businessId, format, headline, subheadline, designStyle } = await request.json();

  const business = await prisma.business.findFirst({
    where: { id: businessId, agencyId: dbUser.agencyId },
  });
  if (!business) {
    return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 });
  }

  const aspectRatios: Record<string, string> = { feed: "1:1", story: "9:16", reel: "9:16" };
  const aspectRatio = aspectRatios[format as string] ?? "1:1";

  const hasLogo = !!business.logoUrl;

  const fontStyleHints: Record<string, string> = {
    Rubik: "bold, geometric, modern sans-serif typography with strong character",
    Assistant: "clean, soft, friendly sans-serif typography with rounded feel",
    "IBM Plex Sans Hebrew": "technical, precise, professional sans-serif typography",
  };
  const fontStyleHint = fontStyleHints[business.fontFamily] ?? "clean modern sans-serif typography";

  const designStyleDescriptions: Record<string, string> = {
    modern_minimal: "Modern Minimal: clean lines, lots of white/negative space, understated elegance, restrained color use — think Apple-style product photography aesthetics",
    luxury: "Luxury: rich deep tones, refined gold/metallic accents used sparingly, premium feel, sophisticated restraint",
    bold_vibrant: "Bold & Vibrant: energetic, high contrast, confident use of color, dynamic feel — but still clean, not cluttered",
    editorial: "Editorial: magazine-cover aesthetic, sophisticated typography treatment, fashion/lifestyle photography feel",
    organic: "Organic & Warm: earthy tones, cozy and inviting, natural textures feel, handcrafted warmth — great for cafes/bakeries/florists",
    dark_premium: "Dark Premium: deep dark background tones, moody dramatic lighting feel, exclusive/premium nightlife or luxury goods aesthetic",
    elegant: "Elegant: soft refined palette, graceful typography, delicate and sophisticated, understated beauty",
    corporate: "Corporate: clean professional B2B aesthetic, trustworthy and polished, structured layout",
    playful: "Playful: friendly and fun, approachable, slightly bouncy energy — appropriate for family/kids/casual brands",
    retro: "Retro/Vintage: nostalgic color grading, classic typography feel, warm vintage character",
    scandinavian: "Scandinavian: light, airy, minimal, natural materials feel, calm and functional beauty",
    cinematic: "Cinematic: dramatic lighting, movie-poster quality composition, wide dynamic range feel, epic mood",
  };

  const styleInstruction =
    designStyle && designStyle !== "auto" && designStyleDescriptions[designStyle]
      ? "Design style direction (must follow closely): " + designStyleDescriptions[designStyle]
      : "Design style direction: choose the most fitting visual design direction for this business's industry (" +
        business.industry +
        ") and mood — for example warm/organic for cafes, luxury/elegant for jewelry, bold/vibrant for gyms, dark/premium for bars, editorial for fashion. Vary your creative choices meaningfully between different generations rather than defaulting to the same generic modern-minimal look every time.";

  const prompt = `אתה ארט-דיירקטור מקצועי בסוכנות פרסום. הטקסט השיווקי כבר סופי ומאושר — המשימה שלך היחידה היא לכתוב פרומפט מפורט באנגלית למודל יצירת תמונה (כמו GPT-Image), שיהפוך תמונה נתונה לפרסומת ברמת סוכנות פרסום מקצועית, לא תמונה שנראית כאילו נוצרה על ידי AI.

נתוני העסק:
צבע ראשי: ${business.colorPrimary}
צבע משני: ${business.colorSecondary}
סגנון טיפוגרפי: ${fontStyleHint}
יש לוגו: ${hasLogo ? "כן, כבר מוטמע בתמונה" : "לא"}
יחס תמונה: ${aspectRatio}

הטקסט הסופי שחייב להופיע בתמונה (מדויק אות-אות, בלי שום שינוי):
כותרת: "${headline}"
תת-כותרת: "${subheadline}"

כתוב imagePrompt מפורט מאוד באנגלית, שכולל את כל הרכיבים הבאים:

**שימור תמונה ולוגו:**
- Preserve the entire provided image exactly as is. Do not modify, replace, or describe its content.
${hasLogo ? "- The logo is already embedded in the photograph (small white circle, upper corner). Never recreate it, never redraw it, never move it, never crop it, never cover it, never sharpen it — treat it as an untouchable part of the original image." : "- No logo present — do not add any fake logo, badge, or tag."}

**כיוון עיצובי (חשוב מאוד, זה מה שקובע רמת מקצועיות):**
- Create a premium social media advertisement that looks like it was designed by an experienced marketing agency, not AI generated. Avoid the typical AI-generated poster appearance — indistinguishable from work created by a professional graphic designer using Adobe Photoshop or Figma.
- ${styleInstruction}
- Modern Israeli advertising sensibility, magazine quality execution.

**היררכיה ויזואלית:**
- Clear visual hierarchy: headline attracts attention first, subtitle supports it, but the original photo remains the main visual focus. Decorative elements must never compete with the subject.

**שטח שלילי וקומפוזיציה:**
- Preserve generous negative space. Avoid overcrowding. Less is more. Elegant, spacious composition.
- Align all text consistently with proper margins and equal spacing, as if using an invisible design grid.
- Leave generous margins around all text; keep everything inside safe zones, away from image edges.

**גרדיאנט וטקסט:**
- Add a subtle dark transparent gradient only where necessary to maximize text readability while preserving the original photograph — natural and integrated, not a heavy overlay.
- Headline: "${headline}" — reproduce this exact Hebrew text character-for-character, do not alter, add, or omit any letter. Large, bold, ${fontStyleHint}, white or very light color with subtle text shadow for readability.
- Subtitle: "${subheadline}" — reproduce this exact Hebrew text character-for-character. Smaller size, same color treatment.
- Premium editorial typography: strong headline, medium subtitle, consistent spacing, excellent readability, professional kerning and line spacing.

**שימוש בצבעי מיתוג (מוגבל בכוונה):**
- Brand colors ${business.colorPrimary} and ${business.colorSecondary} should be used sparingly, only as small accents (a thin line, a subtle border) — never as main text color, never covering more than roughly 10% of the design. White typography must remain dominant for readability.

**עומק ואינטגרציה:**
- Create visual depth — the design should feel integrated into the photo rather than pasted on top of it. Subtle shadows only where appropriate. Everything must belong to the same cohesive visual language — no floating or disconnected elements.

**שיפור תמונה עדין:**
- Subtle professional enhancement of the original photo only: slightly improve lighting, clarity, and contrast. Preserve realism. Do not over-edit, no HDR effects.

**מטרה שיווקית:**
- The design should maximize engagement and encourage visits, prioritizing clarity over decoration.

**להימנע ממנו במפורש:**
Avoid: busy layouts, multiple focal points, heavy effects, lens flares, fake reflections, random decorative shapes, oversized icons, decorative stickers, emoji, AI artifacts, cheap promotional/stock-template appearance, clipart, additional text/tags/watermarks beyond what is specified here.

החזר אך ורק JSON תקין בפורמט הבא, בלי שום טקסט נוסף:
{"imagePrompt": "..."}`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("לא התקבל טקסט מהמודל");
    }

    const cleaned = textBlock.text.trim().replace(/^```json\s*|\s*```$/g, "");
    const parsed = JSON.parse(cleaned);

    if (!parsed.imagePrompt) {
      throw new Error("תשובת המודל חסרה שדה imagePrompt");
    }

    return NextResponse.json({ imagePrompt: parsed.imagePrompt });
  } catch (err) {
    console.error("שגיאה ביצירת imagePrompt:", err);
    return NextResponse.json({ error: "שגיאה ביצירת הנחיית עיצוב" }, { status: 500 });
  }
}