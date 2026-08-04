// app/api/photos/route.ts
import { NextResponse } from "next/server";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "business-photos";
const THUMB_SIZE = 300;

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

  const { businessId, shootLabel, path, url, label } = await request.json();

  if (!businessId || !url || !path) {
    return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 });
  }

  const business = await prisma.business.findFirst({
    where: { id: businessId, agencyId: dbUser.agencyId },
  });
  if (!business) {
    return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 });
  }

  const admin = createAdminClient();

  // יצירת thumbnail בפועל: מורידים את הקובץ המקורי, מקטינים עם sharp,
  // ומעלים כקובץ נפרד. אם משהו כאן נכשל (קובץ לא תקין, sharp נכשל וכו'),
  // לא רוצים לחסום את כל ההעלאה — פשוט נופלים חזרה לשימוש בתמונה
  // המקורית כ-thumbUrl, בדיוק כמו ההתנהגות הקודמת.
  let thumbUrl = url;
  try {
    const { data: originalBlob, error: downloadError } = await admin.storage
      .from(BUCKET)
      .download(path);

    if (!downloadError && originalBlob) {
      const originalBuffer = Buffer.from(await originalBlob.arrayBuffer());

      const thumbBuffer = await sharp(originalBuffer)
        .resize(THUMB_SIZE, THUMB_SIZE, { fit: "cover" })
        .webp({ quality: 80 })
        .toBuffer();

      const thumbPath = path.replace(/(\.[^/.]+)?$/, "-thumb.webp");

      const { error: thumbUploadError } = await admin.storage
        .from(BUCKET)
        .upload(thumbPath, thumbBuffer, { contentType: "image/webp", upsert: true });

      if (!thumbUploadError) {
        const { data: thumbPublicUrl } = admin.storage.from(BUCKET).getPublicUrl(thumbPath);
        thumbUrl = thumbPublicUrl.publicUrl;
      }
    }
  } catch (err) {
    console.error("יצירת thumbnail נכשלה, נופלים חזרה לתמונה המקורית:", err);
  }

  const todayLabel = shootLabel || `העלאות ${new Date().toLocaleDateString("he-IL")}`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let shoot = await prisma.photoShoot.findFirst({
    where: { businessId, shootDate: today },
  });
  if (!shoot) {
    shoot = await prisma.photoShoot.create({
      data: { businessId, label: todayLabel, shootDate: today },
    });
  }

  const photo = await prisma.photo.create({
    data: {
      shootId: shoot.id,
      originalUrl: url,
      thumbUrl,
      label: label || "תמונה",
      status: "available",
    },
  });

  return NextResponse.json({ ok: true, photo });
}