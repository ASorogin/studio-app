// app/api/agency/invite/route.ts
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
  if (!dbUser || dbUser.role !== "owner") {
    return NextResponse.json({ error: "רק בעלים יכול להזמין חברי צוות" }, { status: 403 });
  }

  const { email } = await request.json();
  const trimmedEmail = email?.trim();
  if (!trimmedEmail) {
    return NextResponse.json({ error: "יש להזין כתובת אימייל" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: trimmedEmail } });
  if (existingUser) {
    return NextResponse.json({ error: "משתמש עם המייל הזה כבר קיים במערכת" }, { status: 400 });
  }

  const invite = await prisma.agencyInvite.upsert({
    where: { agencyId_email: { agencyId: dbUser.agencyId, email: trimmedEmail } },
    update: {},
    create: { agencyId: dbUser.agencyId, email: trimmedEmail },
  });

  return NextResponse.json({ ok: true, invite });
}