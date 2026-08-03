// app/api/businesses/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { PlanTier } from "@prisma/client";

const PLAN_LIMITS: Record<PlanTier, number | null> = {
  free: 2,
  pro: 15,
  max: null, // ללא הגבלה
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { agency: true },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "לא נמצא משתמש" }, { status: 401 });
  }

  const limit = PLAN_LIMITS[dbUser.agency.plan];
  if (limit !== null) {
    const currentCount = await prisma.business.count({ where: { agencyId: dbUser.agencyId } });
    if (currentCount >= limit) {
      return NextResponse.json(
        {
          error: `הגעת למגבלת ${limit} עסקים במסלול ${dbUser.agency.plan}. יש לשדרג מסלול כדי להוסיף עוד.`,
        },
        { status: 403 }
      );
    }
  }

  const body = await request.json();
  const { name, industry, colorPrimary, colorSecondary, fontFamily, keywords } = body;

  if (!name || !industry) {
    return NextResponse.json({ error: "שם ותחום הם שדות חובה" }, { status: 400 });
  }

  const business = await prisma.business.create({
    data: {
      agencyId: dbUser.agencyId,
      name,
      industry,
      colorPrimary: colorPrimary || "#1C1620",
      colorSecondary: colorSecondary || "#EFEDE4",
      fontFamily: fontFamily || "Rubik",
      keywords: keywords ?? [],
    },
  });

  return NextResponse.json({ ok: true, business });
}