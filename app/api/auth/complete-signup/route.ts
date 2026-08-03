// app/api/auth/complete-signup/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { agencyName } = await request.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  // אידמפוטנטי: אם כבר יש User עם ה-id הזה (למשל refresh כפול) — לא ליצור שוב
  const existingUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (existingUser) {
    return NextResponse.json({ ok: true, alreadyExists: true });
  }

  const agency = await prisma.agency.create({
    data: {
      name: agencyName || "סוכנות חדשה",
      email: user.email,
      plan: "free",
      users: {
        create: {
          id: user.id, // חשוב: זהה ל-Supabase Auth user id, לא cuid אקראי
          name: user.email.split("@")[0],
          email: user.email,
          role: "owner",
        },
      },
    },
  });

  return NextResponse.json({ ok: true, agencyId: agency.id });
}