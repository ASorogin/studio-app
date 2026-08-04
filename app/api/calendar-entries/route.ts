// app/api/calendar-entries/route.ts
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

  const { businessId, adId, date } = await request.json();
  if (!businessId || !adId || !date) {
    return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 });
  }

  const business = await prisma.business.findFirst({
    where: { id: businessId, agencyId: dbUser.agencyId },
  });
  if (!business) {
    return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 });
  }

  const ad = await prisma.ad.findFirst({ where: { id: adId, businessId } });
  if (!ad) {
    return NextResponse.json({ error: "פרסומת לא נמצאה" }, { status: 404 });
  }

  // אם הפרסומת הזו כבר מתוזמנת למקום אחר — מזיזים אותה לתאריך החדש
  // (מעדכנים את הרשומה הקיימת) במקום ליצור כפילות. פרסומת אחת = תאריך אחד.
  const existingForAd = await prisma.calendarEntry.findFirst({ where: { businessId, adId } });

  const entry = existingForAd
    ? await prisma.calendarEntry.update({
        where: { id: existingForAd.id },
        data: { date: new Date(date), status: "ready" },
      })
    : await prisma.calendarEntry.create({
        data: { businessId, adId, date: new Date(date), status: "ready" },
      });

  return NextResponse.json({ ok: true, entry });
}