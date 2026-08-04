// app/api/events/route.ts
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

  const { name, emoji, type, month, day, categories } = await request.json();

  if (!name || !month || !day) {
    return NextResponse.json({ error: "שם, חודש ויום הם שדות חובה" }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      name,
      emoji: emoji || "📅",
      type: type === "international_day" ? "international_day" : "holiday",
      month: Number(month),
      day: Number(day),
      categories: Array.isArray(categories) ? categories : [],
      isCustom: true,
      agencyId: dbUser.agencyId,
    },
  });

  return NextResponse.json({ ok: true, event });
}