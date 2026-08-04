// app/api/calendar-entries/[id]/route.ts
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

  const entry = await prisma.calendarEntry.findUnique({
    where: { id },
    include: { business: true },
  });
  if (!entry || entry.business.agencyId !== dbUser.agencyId) {
    return NextResponse.json({ error: "רשומה לא נמצאה" }, { status: 404 });
  }

  await prisma.calendarEntry.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}