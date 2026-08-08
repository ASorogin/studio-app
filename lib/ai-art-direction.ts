// lib/ai-art-direction.ts
import Anthropic from "@anthropic-ai/sdk";
import type { Business } from "@prisma/client";
import { fontStyleHints, designStyleDescriptions, creativeAngleDescriptions } from "@/lib/ad-options";

const MODEL = "claude-sonnet-5";
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function bufferToBase64(buffer: Buffer): string {
  return buffer.toString("base64");
}

export async function generateFinalImagePrompt({
  business,
  backgroundBuffer,
  subjectBuffer,
  format,
  headline,
  subheadline,
  includeText,
  designStyle,
  creativeAngle,
  creativeBrief,
  hasLogo,
}: {
  business: Business;
  backgroundBuffer: Buffer;
  subjectBuffer: Buffer | null;
  format: string;
  headline: string;
  subheadline: string;
  includeText: boolean;
  designStyle: string;
  creativeAngle: string;
  creativeBrief: string;
  hasLogo: boolean;
}): Promise<string> {
  const aspectRatios: Record<string, string> = { feed: "1:1", story: "9:16", reel: "9:16" };
  const aspectRatio = aspectRatios[format] ?? "1:1";
  const fontStyleHint = fontStyleHints[business.fontFamily] ?? "clean modern sans-serif character";

  const effectiveStyle = designStyle && designStyle !== "auto" ? designStyle : business.defaultDesignStyle;
  const styleInstruction =
    effectiveStyle && designStyleDescriptions[effectiveStyle]
      ? designStyleDescriptions[effectiveStyle]
      : "choose the most fitting visual design direction for industry: " + business.industry;

  const angleInstruction =
    creativeAngle && creativeAngle !== "auto" && creativeAngleDescriptions[creativeAngle]
      ? creativeAngleDescriptions[creativeAngle]
      : "";

  const subjectLine = subjectBuffer
    ? "התמונה השנייה: נושא/גרפיקה שצריך לשלב בתוך הרקע."
    : "";

  const angleLine = angleInstruction ? "זווית יצירתית: " + angleInstruction : "";

  const briefLine = creativeBrief ? 'קונספט מהמשתמש: "' + creativeBrief + '"' : "";

  const textInstructionBlock = includeText
    ? 'הטקסט הסופי שאושר — חייב להופיע בתמונה, מדויק אות-אות, בלי לשנות אף אות:\nכותרת: "' +
      headline +
      '"\nתת-כותרת: "' +
      subheadline +
      '"'
    : "אין טקסט בפרסומת הזו בכלל — רק ויזואל.";

  const promptText =
    "אתה ארט-דיירקטור ומעצב גרפי בכיר בסוכנות פרסום מובילה, ברמה של מעצב אנושי מנוסה. קיבלת את התמונות בפועל (רואה אותן, לא מנחש), טקסט שכבר אושר סופית, ומידע על המותג. תפקידך היחיד: לכתוב פרומפט מפורט באנגלית למודל GPT-Image-2 שיפיק את הפרסומת המוגמרת — כולל שילוב תמונות, הטמעת הטקסט, ומיקום הלוגו — בקריאה אחת.\n\n" +
    "מה שאתה רואה בתמונה הראשונה (רקע): תארי לעצמך את התאורה, הצבעים, האזורים הריקים, האווירה — והשתמש בזה בפועל בפרומפט.\n" +
    subjectLine +
    "\n\n" +
    "נתוני מותג:\n" +
    "צבע ראשי: " + business.colorPrimary + "\n" +
    "צבע משני: " + business.colorSecondary + "\n" +
    "סגנון טיפוגרפי: " + fontStyleHint + "\n" +
    "יש לוגו: " + (hasLogo ? "כן (תמונת קלט נוספת)" : "לא") + "\n" +
    "יחס תמונה: " + aspectRatio + "\n" +
    "סגנון עיצוב: " + styleInstruction + "\n" +
    angleLine + "\n" +
    briefLine + "\n\n" +
    textInstructionBlock + "\n\n" +
    "כתוב imagePrompt מפורט באנגלית שכולל:\n\n" +
    "1. שימור תמונות: שמרי על הרקע (והנושא, אם יש) נאמן למקור, בלי לתאר תוכן מדומיין.\n\n" +
    "2. שילוב מקצועי בין תמונות (אם יש נושא): התאמת תאורה/צבע/פרספקטיבה/עומק שדה בין הרקע לנושא, צללי מגע ריאליסטיים, קצוות מטושטשים ללא מראה מדבקה — תוצאה שנראית כמו צילום אחד אמיתי, לא קולאז'.\n\n" +
    "3. מיקום לוגו (אם יש): עיגול לבן קטן (80-100px) בפינה, נאמן למקור, בלי לצייר מחדש.\n\n" +
    "4. הטמעת טקסט (אם includeText): הטקסט המדויק שסופק, בפונט גדול ומודגש לכותרת, בהיר/לבן עם צל עדין לקריאות, גרדיאנט כהה חלקי מאחור.\n\n" +
    "5. כלל קשיח למניעת התנגשות (הכי חשוב בפרומפט הזה): הלוגו והטקסט חייבים לשבת באזורים גיאומטריים נפרדים ולא חופפים בתמונה. אם הטקסט ממוקם בתחתית התמונה — הלוגו חייב להיות בפינה העליונה. אם הטקסט ממוקם בצד ימין — הלוגו חייב להיות משמאל (או למעלה). לעולם לא לשים את שניהם באותו רבע של התמונה. יש לציין את זה בפרומפט באופן מפורש וחד-משמעי, לא כהמלצה כללית.\n\n" +
    "6. סגנון עיצובי: רמת סוכנות פרסום מקצועית, לא מראה AI טיפוסי. שטח שלילי נדיב, היררכיה ברורה, בלי עומס.\n\n" +
    "7. צבעי מיתוג: רק כאלמנטים משניים (קו/מסגרת), עד כ-10% מהעיצוב — לא כצבע הטקסט הראשי (שנשאר תמיד לבן/בהיר).\n\n" +
    "8. להימנע מפורשות: layouts עמוסים, אפקטים כבדים, מראה AI, טקסט/תגיות נוספות מעבר למצוין, clipart.\n\n" +
    'החזר אך ורק JSON תקין: {"imagePrompt": "..."}';

  const contentBlocks: Anthropic.MessageParam["content"] = [
    { type: "text", text: promptText },
    {
      type: "image",
      source: { type: "base64", media_type: "image/png", data: bufferToBase64(backgroundBuffer) },
    },
  ];

  if (subjectBuffer) {
    contentBlocks.push({
      type: "image",
      source: { type: "base64", media_type: "image/png", data: bufferToBase64(subjectBuffer) },
    });
  }

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2500,
    messages: [{ role: "user", content: contentBlocks }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("לא התקבל טקסט מהמודל ב-Art Direction");
  }

  const cleaned = textBlock.text
    .trim()
    .replace(/^```json\s*|\s*```$/g, "")
    .replace(/[\r\n\t]+/g, " ");
  const parsed = JSON.parse(cleaned);

  if (!parsed.imagePrompt) {
    throw new Error("תשובת ה-Art Direction חסרה שדה imagePrompt");
  }

  return parsed.imagePrompt;
}