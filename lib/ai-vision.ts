// lib/ai-vision.ts
import Anthropic from "@anthropic-ai/sdk";
import sharp from "sharp";

const MODEL = "claude-sonnet-5";
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type ImageAnalysis = {
  background: {
    description: string;
    dominantColors: string[];
    lightingDirection: string;
    lightingTemperature: string;
    emptySpaceAreas: string[];
    mood: string;
  };
  subject?: {
    description: string;
    suggestedScale: number;
    suggestedPosition: string;
  };
};

function bufferToBase64(buffer: Buffer): string {
  return buffer.toString("base64");
}

export async function analyzeImages({
  backgroundBuffer,
  subjectBuffer,
}: {
  backgroundBuffer: Buffer;
  subjectBuffer: Buffer | null;
}): Promise<ImageAnalysis> {
  const contentBlocks: Anthropic.MessageParam["content"] = [
    {
      type: "text",
      text: `אתה מנתח תמונות עבור ארט-דיירקטור בסוכנות פרסום. נתחי את התמונה/ות המצורפות בפועל, לא באופן כללי — תארי בדיוק מה את רואה.

התמונה הראשונה היא הרקע/סצנה.${
        subjectBuffer
          ? " התמונה השנייה היא נושא/מוצר שצריך להשתלב בתוך הסצנה — נתחי גם אותה."
          : ""
      }

נדרש JSON עם המבנה הבא:
{
  "background": {
    "description": "תיאור קצר ומדויק של מה שרואים בתמונה (לא כללי — ספציפי למה שבאמת שם)",
    "dominantColors": ["#hex1", "#hex2", "#hex3"],
    "lightingDirection": "upper-left | upper-right | front | back | diffuse | top | bottom",
    "lightingTemperature": "warm | cool | neutral",
    "emptySpaceAreas": ["bottom-third", "left-side"],
    "mood": "תיאור קצר של האווירה (חמימה/דרמטית/רגועה/וכו')"
  }${
    subjectBuffer
      ? `,
  "subject": {
    "description": "תיאור מדויק של הנושא/המוצר בתמונה השנייה",
    "suggestedScale": 0.6,
    "suggestedPosition": "right | left | center"
  }`
      : ""
  }
}

חשוב: emptySpaceAreas — זהי באמת אזורים ריקים/פשוטים בתמונה שמתאימים להוספת טקסט (לא אזורים עמוסים בפרטים ויזואליים).

החזר אך ורק JSON תקין, בלי שום טקסט נוסף.`,
    },
    {
      type: "image",
      source: {
        type: "base64",
        media_type: "image/png",
        data: bufferToBase64(backgroundBuffer),
      },
    },
  ];

 if (subjectBuffer) {
    const normalizedSubject = await sharp(subjectBuffer).png().toBuffer();
    contentBlocks.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/png",
        data: bufferToBase64(normalizedSubject),
      },
    });
  }

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [{ role: "user", content: contentBlocks }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("לא התקבל טקסט מהמודל בניתוח התמונות");
  }

  const cleaned = textBlock.text.trim().replace(/^```json\s*|\s*```$/g, "");
  const parsed = JSON.parse(cleaned);

  if (!parsed.background) {
    throw new Error("תשובת הניתוח חסרה שדה background");
  }

  return parsed as ImageAnalysis;
}