// app/api/photos/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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

  const { businessId, shootLabel, url, label } = await request.json();

  if (!businessId || !url) {
    return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 });
  }

  const business = await prisma.business.findFirst({
    where: { id: businessId, agencyId: dbUser.agencyId },
  });
  if (!business) {
    return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 });
  }

  // כרגע כל התמונות שמועלות "עכשיו" משויכות ליום צילום יומי אוטומטי,
  // כדי לא להכריח את המשתמש לנהל "ימי צילום" באופן ידני בשלב הזה.
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
      thumbUrl: url, // TODO: יצירת thumbnail אמיתי — ראו הערה בהמשך
      label: label || "תמונה",
      status: "available",
    },
  });

  return NextResponse.json({ ok: true, photo });
}