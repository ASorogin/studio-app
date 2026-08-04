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

  const formatLabels = { feed: "פוסט פיד", story: "סטורי", reel: "ריל" };
  const formatLabel = formatLabels[format as "feed" | "story" | "reel"] ?? "פוסט";

  const eventTypeLabels: Record<string, string> = { holiday: "חג", international_day: "יום בינלאומי" };
  const eventKindLabel = eventType ? eventTypeLabels[eventType as string] ?? "" : "";
  const eventLine = eventName
    ? "הפרסומת הזו מיועדת ל" + (eventKindLabel || "אירוע") + ": " + eventName +
      ". הטקסט חייב להתייחס בפועל לאירוע הזה, לא רק לעסק באופן כללי."
    : "";

  const prompt = "כתוב טקסט פרסומת קצר לרשתות חברתיות בעברית עבור העסק הבא:\n\n" +
    "שם העסק: " + business.name + "\n" +
    "תחום: " + business.industry + "\n" +
    "מילות מפתח: " + business.keywords.join(", ") + "\n" +
    "פורמט: " + formatLabel + "\n" +
    eventLine + "\n\n" +
    "החזר אך ורק JSON תקין בפורמט הבא, בלי שום טקסט נוסף לפניו או אחריו:\n" +
    '{"headline": "כותרת קצרה וקליטה, עד 6 מילים", "caption": "משפט או שניים, טון חם ומזמין, עד 25 מילים"}';

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find(function (block) {
      return block.type === "text";
    });
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("לא התקבל טקסט מהמודל");
    }

    const cleaned = textBlock.text.trim().replace(/^```json\s*|\s*```$/g, "");
    const parsed = JSON.parse(cleaned);

    if (!parsed.headline || !parsed.caption) {
      throw new Error("תשובת המודל חסרה שדות");
    }

    return NextResponse.json({ headline: parsed.headline, caption: parsed.caption });
  } catch (err) {
    console.error("שגיאה ביצירת טקסט אוטומטי:", err);
    return NextResponse.json({ error: "שגיאה ביצירת טקסט אוטומטי" }, { status: 500 });
  }
}
