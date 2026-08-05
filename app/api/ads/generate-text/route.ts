// app/api/ads/generate-text/route.ts
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

  const { businessId, format, eventName, eventType, campaignNote } = await request.json();

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
    ? "⚠️ חשוב מאוד: הפרסומת הזו מיועדת ל" + (eventKindLabel || "אירוע") + " \"" + eventName +
      "\". זה לא עוד פרסומת כללית — היא חייבת להרגיש כמו פרסומת מיוחדת לאירוע הזה, עם אזכור מפורש שלו, לא רק תוכן גנרי על העסק."
    : "";

  const campaignLine = campaignNote
    ? "פרט חובה מוחלט, שהמשתמש ביקש במפורש לכלול (מספרים/שעות/תאריכים — בלי לשנות עובדות): \"" + campaignNote + "\""
    : "";

  const headlineRequirement = campaignNote
    ? "   חובה מוחלטת: חייבת לכלול את פרט הקמפיין, בניסוח תמציתי." +
      (eventName ? " וגם — חייבת לקשר את זה לאירוע " + eventName + " (למשל דרך שם החג/היום בתוך הכותרת עצמה)." : "")
    : eventName
      ? "   חובה מוחלטת: חייבת להזכיר במפורש את שם האירוע/החג \"" + eventName + "\" או וריאציה טבעית וברורה שלו (למשל ברכת החג המקובלת) — זה הדבר הכי חשוב בכותרת הזו."
      : "   חובה: לפחות אחת ממילות המפתח (או וריאציה טבעית).";

  const subheadlineRequirement =
    campaignNote || eventName
      ? "   הפרט העיקרי (קמפיין/אירוע) כבר ב-headline — subheadline צריך להוסיף זווית שונה (שם העסק, ערך מוסף, למה כדאי), לא לחזור על אותו מידע."
      : "   צריך להוסיף מידע שונה מה-headline, לא לחזור עליו.";

  const prompt = `אתה Senior Copywriter ו-Creative Director בסוכנות הפרסום המובילה בישראל. המטרה שלך היא ליצור תוכן שמגדיל הקלקות, פניות ומכירות — כתוב כפי שסוכנות מקצועית הייתה כותבת ללקוח משלם, לא טקסט גנרי.

נתוני העסק:
שם: ${business.name}
תחום: ${business.industry}
מילות מפתח: ${business.keywords.join(", ")}
פורמט: ${formatLabel}
${eventLine}
${campaignLine}

מטרת הפרסום: להגדיל עצירות גלילה (scroll-stop), ליצור עניין תוך שנייה, לעודד קריאת הפוסט המלא, ולגרום לפעולה (ביקור/הזמנה/פנייה).

לפני שאתה כותב, חשוב בשקט (אל תדפיס את זה בתשובה): מי קהל היעד? איזו רגש יגרום לו לעצור גלילה? מה יבדל את העסק הזה ממתחרים? השתמש בתובנות האלה בתשובה הסופית.

נדרש להחזיר JSON עם 4 שדות:

1. "headline" — כותרת קצרה (3-6 מילים), Hook אמיתי: חייבת לעצור גלילה, לעורר סקרנות/רצון, בלי קלישאות או סיסמאות גנריות.
${headlineRequirement}

2. "subheadline" — משפט קצר אחד (עד 12 מילים) שיופיע **בתוך התמונה עצמה**, מתחת לכותרת. קצר וקריא, לא משפט מורכב.
${subheadlineRequirement}

3. "caption" — טקסט הפוסט המלא (נפרד לגמרי מ-headline/subheadline, יכול להיות ארוך יותר): 2-4 משפטים, טון חם ומזמין, CTA טבעי בסוף (לא אגרסיבי, לא "לחוץ" — הזמנה טבעית, משפט קצר אחד). סה"כ: לפחות 2-3 ממילות המפתח משולבות באופן טבעי בטקסט.

4. "hashtags" — 6-10 האשטגים שאנשים בפועל מחפשים/משתמשים בהם: שילוב של תחום, מיקום (אם רלוונטי), מותג, לייפסטייל. אנגלית רק אם נפוץ בהקשר. בלי הסימן #.

חובה — הימנע לחלוטין מקלישאות שיווקיות גנריות כמו: "איכות ללא פשרות", "אנחנו כאן בשבילכם", "כי מגיע לכם", "חוויה שלא תשכחו", "הטוב ביותר", "בואו ליהנות", "שירות מכל הלב", "מחכים לכם", "מזמינים אתכם", "שווה להגיע". גם הימנע ממילים נדירות/ארכאיות/משמעות מוזרה בהקשר (למשל "גיגית" לתיאור כוס).

מה כן: קצר, ברור, נשמע אנושי, זורם, טבעי, ישראלי, אינסטגרמי.
מה לא: רובוטי, מתורגם, פיוטי מוגזם.

אין להמציא עובדות שלא סופקו (מספרים/מחירים/שעות/הבטחות) — אם אין פרט קונקרטי, השאר כללי.

לפני שאתה מחזיר את ה-JSON, וודא בשקט (אל תדפיס): הכותרת מעניינת ולא גנרית? ${eventName ? "האם האירוע " + eventName + " בפועל מוזכר?" : ""} ה-caption נשמע טבעי? אין חזרה על אותו מידע פעמיים? הכל יכול להופיע באמת בעמוד אינסטגרם של עסק ישראלי? אם לא — כתוב מחדש לפני שאתה עונה.

החזר אך ורק JSON תקין, בלי שום טקסט נוסף לפניו או אחריו:
{"headline": "...", "subheadline": "...", "caption": "...", "hashtags": ["..."]}`;

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

    if (!parsed.headline || !parsed.subheadline || !parsed.caption) {
      throw new Error("תשובת המודל חסרה שדות");
    }

    return NextResponse.json({
      headline: parsed.headline,
      subheadline: parsed.subheadline,
      caption: parsed.caption,
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
    });
  } catch (err) {
    console.error("שגיאה ביצירת טקסט אוטומטי:", err);
    return NextResponse.json({ error: "שגיאה ביצירת טקסט אוטומטי" }, { status: 500 });
  }
}