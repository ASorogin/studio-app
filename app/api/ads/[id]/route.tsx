// app/api/ads/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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

  const ad = await prisma.ad.findFirst({
    where: { id, business: { agencyId: dbUser.agencyId } },
  });
  if (!ad) {
    return NextResponse.json({ error: "פרסומת לא נמצאה" }, { status: 404 });
  }

  // מסירים קודם כל שיוך ליומן (אם קיים), ורק אז את הפרסומת עצמה —
  // כדי שלא יישארו רשומות CalendarEntry "יתומות" שמצביעות לפרסומת שנמחקה.
  await prisma.$transaction([
    prisma.calendarEntry.deleteMany({ where: { adId: id } }),
    prisma.ad.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}