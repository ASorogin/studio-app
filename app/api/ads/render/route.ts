// app/api/ads/render/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderAdImage, buildFallbackImagePrompt } from "@/lib/render-ad";
import { generateAdImageWithAI } from "@/lib/ai-image";

const BUCKET = "business-photos";

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

  const { businessId, photoId, headline, caption, format, textMode, eventId, imagePrompt } =
    await request.json();

  const business = await prisma.business.findFirst({
    where: { id: businessId, agencyId: dbUser.agencyId },
  });
  if (!business) {
    return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 });
  }

  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) {
    return NextResponse.json({ error: "תמונה לא נמצאה" }, { status: 404 });
  }

  try {
    const photoRes = await fetch(photo.originalUrl);
    if (!photoRes.ok) throw new Error("שגיאה בהורדת התמונה המקורית");
    const photoBuffer = Buffer.from(await photoRes.arrayBuffer());

    let logoBuffer: Buffer | null = null;
    if (business.logoUrl) {
      try {
        const logoRes = await fetch(business.logoUrl);
        if (logoRes.ok) {
          logoBuffer = Buffer.from(await logoRes.arrayBuffer());
        }
      } catch {
        // לוגו לא זמין — ממשיכים בלי לוגו
      }
    }

    // שלב 1: sharp מדביק לוגו (אם יש) ומתאים גודל — בדיוק כמו קודם.
    const composedBuffer = await renderAdImage({ photoBuffer, logoBuffer, format });

    // שלב 2: ניסיון להעשיר עם AI (גרדיאנט + טקסט מוטבע). אם נכשל מכל
    // סיבה (רשת, מכסה, שגיאת API) — נופלים חזרה לתמונה מ-sharp בלבד,
    // בלי טקסט מוטבע. ה-Ad עדיין נוצר בהצלחה; ה-caption הנפרד עדיין
    // מוצג תמיד ב-UI, אז שום מידע לא אובד למשתמש.
    let finalBuffer = composedBuffer;
    try {
      const subheadline = caption.split("\n")[0].split(".")[0] + ".";
      const promptToUse =
        imagePrompt ||
        buildFallbackImagePrompt({
          business,
          headline,
          subheadline,
          hasLogo: !!logoBuffer,
        });

      finalBuffer = await generateAdImageWithAI({
        imageBuffer: composedBuffer,
        prompt: promptToUse,
        format,
      });
    } catch (err) {
      console.error("יצירת תמונה עם AI נכשלה, נופלים חזרה לתמונה בסיסית:", err);
    }

    const admin = createAdminClient();
    const path = `${dbUser.agencyId}/${businessId}/ads/${Date.now()}.png`;
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, finalBuffer, { contentType: "image/png", upsert: true });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(path);

    const ad = await prisma.ad.create({
      data: {
        businessId,
        photoId,
        format,
        headline,
        caption,
        textMode: textMode ?? "auto",
        outputImageUrl: publicUrlData.publicUrl,
        eventId: eventId ?? null,
      },
    });

    await prisma.photo.update({ where: { id: photoId }, data: { status: "used" } });

    return NextResponse.json({ ok: true, ad });
  } catch (err) {
    console.error("שגיאה ברינדור הפרסומת:", err);
    return NextResponse.json({ error: "שגיאה ברינדור הפרסומת" }, { status: 500 });
  }
}