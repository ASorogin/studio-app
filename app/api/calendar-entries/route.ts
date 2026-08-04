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

  // מונע כפילות אם אותה פרסומת בדיוק כבר מתוזמנת לאותו תאריך —
  // אבל מאפשר כמה פרסומות שונות לאותו תאריך (פוסטים שונים לרשתות שונות).
  const existing = await prisma.calendarEntry.findFirst({
    where: { businessId, adId, date: new Date(date) },
  });
  if (existing) {
    return NextResponse.json({ ok: true, entry: existing });
  }

  const entry = await prisma.calendarEntry.create({
    data: { businessId, adId, date: new Date(date), status: "ready" },
  });

  return NextResponse.json({ ok: true, entry });
}