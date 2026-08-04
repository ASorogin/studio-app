// app/api/ads/render/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderAdImage } from "@/lib/render-ad";

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

  const { businessId, photoId, headline, caption, format, textMode, eventId } = await request.json();

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
        // לוגו לא זמין מכל סיבה — ממשיכים בלי לוגו, לא חוסמים את התהליך
      }
    }

    const outputBuffer = await renderAdImage({ photoBuffer, logoBuffer, format });

    const admin = createAdminClient();
    const path = `${dbUser.agencyId}/${businessId}/ads/${Date.now()}.png`;
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, outputBuffer, { contentType: "image/png", upsert: true });
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