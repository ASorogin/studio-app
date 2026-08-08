// app/api/agency/invite/[id]/route.ts
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
  if (!dbUser || dbUser.role !== "owner") {
    return NextResponse.json({ error: "רק בעלים יכול לבטל הזמנה" }, { status: 403 });
  }

  const invite = await prisma.agencyInvite.findFirst({
    where: { id, agencyId: dbUser.agencyId },
  });
  if (!invite) {
    return NextResponse.json({ error: "הזמנה לא נמצאה" }, { status: 404 });
  }

  await prisma.agencyInvite.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}