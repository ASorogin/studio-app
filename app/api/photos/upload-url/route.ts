// app/api/photos/upload-url/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const { businessId, fileName } = await request.json();

  if (!businessId || !fileName) {
    return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 });
  }

  // אימות בעלות: מוודאים שהעסק שייך לסוכנות של המשתמש לפני שנותנים לו
  // כתובת העלאה — אחרת כל משתמש מחובר יכול היה להעלות "לתוך" עסק שלא שלו.
  const business = await prisma.business.findFirst({
    where: { id: businessId, agencyId: dbUser.agencyId },
  });
  if (!business) {
    return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 });
  }

  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${dbUser.agencyId}/${businessId}/${Date.now()}-${safeFileName}`;

  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ error: "שגיאה ביצירת קישור העלאה" }, { status: 500 });
  }

  const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  });
}