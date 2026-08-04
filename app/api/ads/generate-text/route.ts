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

  const eventTypeLabels: Record<string, string> = { holiday: "חג", international_day: "יום בינלאומי" };
  const eventKindLabel = eventType ? eventTypeLabels[eventType as string] ?? "" : "";
  const eventLine = eventName
    ? "הפרסומת הזו מיועדת ל" + (eventKindLabel || "אירוע") + ": " + eventName +
      ". הטקסט חייב להתייחס בפועל לאירוע הזה, לא רק לעסק באופן כללי."
    : "";

  const prompt = `כתוב תוכן לפוסט ברשתות חברתיות בעברית עבור העסק הבא:

שם העסק: ${business.name}
תחום: ${business.industry}
מילות מפתח: ${business.keywords.join(", ")}
פורמט: ${formatLabel}
${eventLine}

נדרש:
1. headline — כותרת קצרה וקליטה (עד 6 מילים), למסך/תמונה
2. caption — טקסט מלא לפוסט עצמו: 2-4 משפטים, טון חם ומזמין ומקצועי, שקורא לפעולה בסוף (כמו "בואו לבקר", "שריינו מקום", "שלחו הודעה"). זה הטקסט שהמשתמש בפועל יעתיק וידביק לאינסטגרם/פייסבוק — צריך לעמוד בפני עצמו כפוסט שלם, לא רק משפט תיאורי.
3. hashtags — מערך של 6-10 האשטגים רלוונטיים בעברית (ולפחות 2-3 באנגלית אם רלוונטי לתחום), בלי הסימן # עצמו (הוא יתווסף אוטומטית בתצוגה) — משלבים תחום, מיקום כללי (ישראל), ומילות מפתח של העסק

החזר אך ורק JSON תקין בפורמט הבא, בלי שום טקסט נוסף לפניו או אחריו:
{"headline": "...", "caption": "...", "hashtags": ["...", "..."]}`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("לא התקבל טקסט מהמודל");
    }

    const cleaned = textBlock.text.trim().replace(/^```json\s*|\s*```$/g, "");
    const parsed = JSON.parse(cleaned);

    if (!parsed.headline || !parsed.caption) {
      throw new Error("תשובת המודל חסרה שדות");
    }

    return NextResponse.json({
      headline: parsed.headline,
      caption: parsed.caption,
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
    });
  } catch (err) {
    console.error("שגיאה ביצירת טקסט אוטומטי:", err);
    return NextResponse.json({ error: "שגיאה ביצירת טקסט אוטומטי" }, { status: 500 });
  }
}