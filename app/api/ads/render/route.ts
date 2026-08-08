// app/api/ads/render/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resizePhotoForAd } from "@/lib/render-ad";
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

  const {
    businessId,
    backgroundPhotoId,
    subjectPhotoId,
    headline,
    subheadline,
    caption,
    format,
    textMode,
    includeText,
    eventId,
    imagePrompt,
  } = await request.json();

  const business = await prisma.business.findFirst({
    where: { id: businessId, agencyId: dbUser.agencyId },
  });
  if (!business) {
    return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 });
  }

  const backgroundPhoto = await prisma.photo.findUnique({ where: { id: backgroundPhotoId } });
  if (!backgroundPhoto) {
    return NextResponse.json({ error: "תמונת רקע לא נמצאה" }, { status: 404 });
  }

  const subjectPhoto = subjectPhotoId
    ? await prisma.photo.findUnique({ where: { id: subjectPhotoId } })
    : null;

  try {
    const bgRes = await fetch(backgroundPhoto.originalUrl);
    if (!bgRes.ok) throw new Error("שגיאה בהורדת תמונת הרקע");
    const bgBuffer = Buffer.from(await bgRes.arrayBuffer());
    const resizedBg = await resizePhotoForAd({ photoBuffer: bgBuffer, format });

    const imageBuffers: Buffer[] = [resizedBg];

    if (subjectPhoto) {
      const subjRes = await fetch(subjectPhoto.originalUrl);
      if (subjRes.ok) imageBuffers.push(Buffer.from(await subjRes.arrayBuffer()));
    }

    if (business.logoUrl) {
      try {
        const logoRes = await fetch(business.logoUrl);
        if (logoRes.ok) imageBuffers.push(Buffer.from(await logoRes.arrayBuffer()));
      } catch {
        // לוגו לא זמין — ממשיכים בלעדיו
      }
    }

    // קריאה אחת ל-GPT-Image-2 — מחזירה את הפרסומת המוגמרת: ויזואל +
    // לוגו + טקסט (אם יש), הכל מוטבע יחד על ידי אותו מודל.
    const finalBuffer = await generateAdImageWithAI({ imageBuffers, prompt: imagePrompt, format });

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
        photoId: backgroundPhotoId,
        format,
        headline: includeText ? headline || "" : "",
        caption: includeText ? caption || "" : "",
        textMode: textMode ?? "auto",
        outputImageUrl: publicUrlData.publicUrl,
        eventId: eventId ?? null,
      },
    });

    await prisma.photo.update({ where: { id: backgroundPhotoId }, data: { status: "used" } });
    if (subjectPhotoId) {
      await prisma.photo.update({ where: { id: subjectPhotoId }, data: { status: "used" } });
    }

    return NextResponse.json({ ok: true, ad });
  } catch (err) {
    console.error("שגיאה ברינדור הפרסומת:", err);
    return NextResponse.json({ error: "שגיאה ברינדור הפרסומת" }, { status: 500 });
  }
}