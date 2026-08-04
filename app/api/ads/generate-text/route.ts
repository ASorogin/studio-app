// app/api/ads/generate-text/route.ts
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const MODEL = "claude-haiku-4-5-20251001";

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

  const { businessId, format, eventName, eventType } = await request.json();

  const business = await prisma.business.findFirst({
    where: { id: businessId, agencyId: dbUser.agencyId },
  });
  if (!business) {
    return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 });
  }

  const formatLabels: Record<string, string> = { feed: "פוסט פיד", story: "סטורי", reel: "ריל" };
  const formatLabel = formatLabels[format as string] ?? "פוסט";

  const aspectRatios: Record<string, string> = { feed: "1:1", story: "9:16", reel: "9:16" };
  const aspectRatio = aspectRatios[format as string] ?? "1:1";

  const eventTypeLabels: Record<string, string> = { holiday: "חג", international_day: "יום בינלאומי" };
  const eventKindLabel = eventType ? eventTypeLabels[eventType as string] ?? "" : "";
  const eventLine = eventName
    ? "הפרסומת הזו מיועדת ל" + (eventKindLabel || "אירוע") + ": " + eventName +
      ". הטקסט חייב להתייחס בפועל לאירוע הזה, לא רק לעסק באופן כללי."
    : "";

  const hasLogo = !!business.logoUrl;

  const fontStyleHints: Record<string, string> = {
    Rubik: "bold, geometric, modern sans-serif typography with strong character",
    Assistant: "clean, soft, friendly sans-serif typography with rounded feel",
    "IBM Plex Sans Hebrew": "technical, precise, professional sans-serif typography",
  };
  const fontStyleHint = fontStyleHints[business.fontFamily] ?? "clean modern sans-serif typography";

  const prompt = `אתה עוזר ליצירת פרסומות לרשתות חברתיות עבור סוכנות דיגיטל. עבור העסק הבא, צור תוכן שיווקי מלא:

שם העסק: ${business.name}
תחום: ${business.industry}
מילות מפתח: ${business.keywords.join(", ")}
פורמט: ${formatLabel} (יחס ${aspectRatio})
צבע ראשי: ${business.colorPrimary}
צבע משני: ${business.colorSecondary}
יש לוגו לעסק: ${hasLogo ? "כן" : "לא"}
${eventLine}

נדרש להחזיר JSON עם 4 שדות:

1. "headline" — כותרת קצרה וקליטה (עד 6 מילים) בעברית.
2. "caption" — טקסט מלא לפוסט עצמו: 2-4 משפטים, טון חם ומזמין ומקצועי, עם קריאה לפעולה בסוף.

חשוב מאוד לגבי איכות הניסוח (חל גם על headline וגם על caption):
- וודא איות נכון ותקין של כל מילה
- השתמש אך ורק במילים נפוצות ושגרתיות בעברית ישראלית יומיומית/שיווקית, כמו שסוכנות פרסום אמיתית הייתה כותבת
- הימנע לחלוטין ממילים נדירות, ארכאיות, גבוהות מדי, או כאלה שיוצרות משמעות מוזרה/לא מתאימה בהקשר — לדוגמה: אסור לתאר כוס קפה כ"גיגית" (זה מכל גדול, לא מתאים), אסור ניסוחים "פיוטיים" מדי שנשמעים מתורגמים או לא טבעיים
- לפני סיום, שקול: האם ניסוח כזה יופיע בפועל בפוסט אינסטגרם אמיתי של עסק ישראלי? אם משהו נשמע מוזר, מלאכותי, או "יותר מדי", נסח מחדש בפשטות
3. "hashtags" — מערך של 6-10 האשטגים רלוונטיים בעברית (ולפחות 2-3 באנגלית אם רלוונטי לתחום), בלי הסימן #
4. "imagePrompt" — פרומפט מלא באנגלית, מוכן לשליחה ישירה למודל יצירת תמונה (כמו GPT-Image), שמתאר בדיוק איך להפוך תמונה נתונה לפרסומת גרפית מלאה. הפרומפט חייב לכלול את כל הרכיבים הבאים בצורה מפורשת ומדויקת:
   - הנחיה לשמר את התמונה הנתונה במלואה, בלי לשנות אותה. חשוב: אסור לתאר או לדמיין מה אמור להיות בתמונה (למשל "a photo of X") — יש להניח שתמונה אמיתית תצורף בפועל, ורק לתת הנחיית שימור, לא תיאור תוכן. ${hasLogo ? "התמונה הנתונה כבר כוללת לוגו של העסק מודבק בפינה עליונה (עיגול לבן קטן) — יש לשמר אותו בדיוק כמו שהוא, בלי לצייר אותו מחדש, בלי להזיז אותו, ובלי לגעת בו כלל." : "אין לוגו בתמונה הזו — אין להוסיף שום תג/עיגול/לוגו מדומה."}
   - הנחיה להוסיף גרדיאנט כהה חלקי בשליש התחתון של התמונה
   - הכותרת המדויקת בעברית (בדיוק כפי שנכתבה בשדה headline למעלה, מילה במילה, כולל האיות המדויק) בפונט גדול ומודגש, בשליש התחתון
   - תת-הכותרת המדויקת בעברית (המשפט הראשון מתוך caption, מילה במילה, כולל האיות המדויק) מתחת לכותרת, בגודל קטן יותר
  - הכותרת ותת-הכותרת חייבות להיות בצבע לבן או בהיר מאוד, עם צל עדין (text shadow) להבטחת קריאות מרבית על גבי הגרדיאנט הכהה — לעולם לא בצבעי המיתוג עצמם, כי זה עלול לפגוע בניגודיות ובקריאות
   - שימוש בצבע הראשי ${business.colorPrimary} ובצבע המשני ${business.colorSecondary} **רק** כאלמנטים עיצוביים נלווים (למשל קו הפרדה דק, מסגרת לעיגול הלוגו, פס דקורטיבי) — לא כצבע הטקסט הראשי
   - סגנון טיפוגרפי לכותרת ולתת-כותרת (תיאור סגנון בלבד — אין לציין שמות פונטים ספציפיים כמו Montserrat/Inter כי הטקסט בעברית ופונטים לטיניים לא רלוונטיים): ${fontStyleHint}
   - יחס התמונה: ${aspectRatio}
   - הנחיה מפורשת: "no overlap between the logo area and the text area", "no additional text, tags, or graphic elements beyond what is specified", "professional unified design, not two separate elements pasted together"

החזר אך ורק JSON תקין, בלי שום טקסט נוסף לפניו או אחריו:
{"headline": "...", "caption": "...", "hashtags": ["..."], "imagePrompt": "..."}`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("לא התקבל טקסט מהמודל");
    }

    const cleaned = textBlock.text.trim().replace(/^```json\s*|\s*```$/g, "");
    const parsed = JSON.parse(cleaned);

    if (!parsed.headline || !parsed.caption || !parsed.imagePrompt) {
      throw new Error("תשובת המודל חסרה שדות");
    }

    return NextResponse.json({
      headline: parsed.headline,
      caption: parsed.caption,
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      imagePrompt: parsed.imagePrompt,
    });
  } catch (err) {
    console.error("שגיאה ביצירת טקסט אוטומטי:", err);
    return NextResponse.json({ error: "שגיאה ביצירת טקסט אוטומטי" }, { status: 500 });
  }
}