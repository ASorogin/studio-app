// app/api/events/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  // אפשר לערוך רק אירועים מותאמים אישית ששייכים לסוכנות הזו — לא
  // אירועים גלובליים (agencyId null) שמשותפים לכל המערכת.
  const existing = await prisma.event.findFirst({
    where: { id, agencyId: dbUser.agencyId, isCustom: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "אירוע לא נמצא או שאינו ניתן לעריכה" }, { status: 404 });
  }

  const { name, emoji, type, month, day, categories } = await request.json();

  const event = await prisma.event.update({
    where: { id },
    data: {
      name,
      emoji: emoji || "📅",
      type: type === "international_day" ? "international_day" : "holiday",
      month: Number(month),
      day: Number(day),
      categories: Array.isArray(categories) ? categories : [],
    },
  });

  return NextResponse.json({ ok: true, event });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  const existing = await prisma.event.findFirst({
    where: { id, agencyId: dbUser.agencyId, isCustom: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "אירוע לא נמצא או שאינו ניתן למחיקה" }, { status: 404 });
  }

  await prisma.event.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}