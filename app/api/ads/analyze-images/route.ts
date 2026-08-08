// app/api/ads/analyze-images/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { analyzeImages } from "@/lib/ai-vision";
import { resizePhotoForAd } from "@/lib/render-ad";

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

  const { businessId, backgroundPhotoId, subjectPhotoId, format } = await request.json();

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

  try {
    const bgRes = await fetch(backgroundPhoto.originalUrl);
    if (!bgRes.ok) throw new Error("שגיאה בהורדת תמונת הרקע");
    const bgBuffer = Buffer.from(await bgRes.arrayBuffer());
    const resizedBg = await resizePhotoForAd({ photoBuffer: bgBuffer, format });

    let subjectBuffer: Buffer | null = null;
    if (subjectPhotoId) {
      const subjectPhoto = await prisma.photo.findUnique({ where: { id: subjectPhotoId } });
      if (subjectPhoto) {
        const subjRes = await fetch(subjectPhoto.originalUrl);
        if (subjRes.ok) {
          subjectBuffer = Buffer.from(await subjRes.arrayBuffer());
        }
      }
    }

    const analysis = await analyzeImages({ backgroundBuffer: resizedBg, subjectBuffer });

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("שגיאה בניתוח תמונות:", err);
    return NextResponse.json({ error: "שגיאה בניתוח התמונות" }, { status: 500 });
  }
}