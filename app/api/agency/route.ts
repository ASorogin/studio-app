// app/api/agency/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
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

  // רק owner יכול לערוך את פרטי הסוכנות
  if (dbUser.role !== "owner") {
    return NextResponse.json({ error: "רק בעלים יכול לערוך פרטי סוכנות" }, { status: 403 });
  }

  const { name, email } = await request.json();

  const updated = await prisma.agency.update({
    where: { id: dbUser.agencyId },
    data: { name, email },
  });

  return NextResponse.json({ ok: true, agency: updated });
}