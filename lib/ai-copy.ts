// lib/ai-copy.ts
import Anthropic from "@anthropic-ai/sdk";
import type { Business, Event } from "@prisma/client";
import { creativeAngleDescriptions } from "@/lib/ad-options";

const MODEL = "claude-sonnet-5";
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type CopySuggestion = {
  headline: string;
  subheadline: string;
  caption: string;
  hashtags: string[];
};

export async function generateCopySuggestions({
  business,
  format,
  rawIdea,
  creativeAngle,
  event,
}: {
  business: Business;
  format: string;
  rawIdea: string;
  creativeAngle: string;
  event: Event | null;
}): Promise<CopySuggestion[]> {
  const formatLabels: Record<string, string> = { feed: "פוסט פיד", story: "סטורי", reel: "ריל" };
  const formatLabel = formatLabels[format] ?? "פוסט";

  const eventTypeLabels: Record<string, string> = { holiday: "חג", international_day: "יום בינלאומי" };
  const eventLine = event
    ? "⚠️ חשוב: הפרסומת מיועדת ל" + (eventTypeLabels[event.type] ?? "אירוע") + ' "' + event.name +
      '". חייבת להרגיש כמו פרסומת מיוחדת לאירוע הזה, לא תוכן גנרי.'
    : "";

  const angleLine =
    creativeAngle && creativeAngle !== "auto" && creativeAngleDescriptions[creativeAngle]
      ? "זווית יצירתית מחייבת: " + creativeAngleDescriptions[creativeAngle]
      : "";

  const prompt = `אתה Senior Copywriter ו-Creative Director בסוכנות פרסום ישראלית מובילה. המשתמש (מנהל השיווק של העסק) נתן לך רעיון גרעיני, ואתה משכתב/משפר אותו לכדי תוכן שיווקי מקצועי — לא ממציא רעיון חדש משלך, אלא לוקח את מה שהוא כתב ומרים את הרמה.

נתוני העסק:
שם: ${business.name}
תחום: ${business.industry}
מילות מפתח: ${business.keywords.join(", ")}
פורמט: ${formatLabel}
${eventLine}
${angleLine}

הרעיון הגרעיני של המשתמש (הבסיס לכל התוכן — אל תסטה ממנו למשהו אחר לגמרי, רק שפר את הניסוח):
"${rawIdea}"

צור **3 חלופות שונות** לאותו רעיון — כל אחת עם טון/זווית ניסוח מעט שונים (למשל: אחת ישירה יותר, אחת חמה יותר, אחת תמציתית יותר) — כדי שהמשתמש יוכל לבחור את מה שמתאים לו.

לכל חלופה, JSON עם 4 שדות:
1. "headline" — כותרת קצרה (3-6 מילים), Hook אמיתי שעוצר גלילה.
2. "subheadline" — משפט קצר אחד (עד 12 מילים) שיופיע בתוך התמונה עצמה, מתחת לכותרת. חייב להוסיף זווית שונה מה-headline, לא לחזור על אותו מידע.
3. "caption" — טקסט הפוסט המלא (2-4 משפטים), טון חם ומזמין, CTA טבעי בסוף.
4. "hashtags" — 6-10 האשטגים רלוונטיים (רוב בעברית, אנגלית רק אם נפוץ בהקשר), בלי הסימן #.

חובה בכל החלופות:
- וודא איות נכון ותקין של כל מילה
- הימנע לחלוטין מקלישאות שיווקיות גנריות ("איכות ללא פשרות", "אנחנו כאן בשבילכם", "כי מגיע לכם", "חוויה שלא תשכחו", "הטוב ביותר", "בואו ליהנות", "שירות מכל הלב", "מחכים לכם", "מזמינים אתכם", "שווה להגיע")
- הימנע ממילים נדירות/ארכאיות/משמעות מוזרה בהקשר (למשל "גיגית" לתיאור כוס)
- אין להמציא עובדות שלא נמסרו ברעיון המקורי (מספרים/מחירים/שעות)
- מבחן לפני סיום: האם ניסוח כזה יופיע בפועל בפוסט אינסטגרם אמיתי של עסק ישראלי?

החזר אך ורק JSON תקין — מערך של 3 אובייקטים, בלי שום טקסט נוסף:
{"suggestions": [{"headline": "...", "subheadline": "...", "caption": "...", "hashtags": ["..."]}, ...]}`;

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

  if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length === 0) {
    throw new Error("תשובת המודל לא כללה הצעות");
  }

  return parsed.suggestions;
}