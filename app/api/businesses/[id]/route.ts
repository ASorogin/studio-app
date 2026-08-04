// app/api/businesses/[id]/route.ts
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

  // אימות בעלות: לוודא שהעסק הזה שייך לסוכנות של המשתמש המחובר,
  // לפני שמאפשרים לו לעדכן משהו.
  const existing = await prisma.business.findFirst({
    where: { id, agencyId: dbUser.agencyId },
  });
  if (!existing) {
    return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 });
  }

  const body = await request.json();
  const { name, industry, logoUrl, colorPrimary, colorSecondary, fontFamily, keywords } = body;

  const updated = await prisma.business.update({
    where: { id },
    data: {
      name,
      industry,
      logoUrl: logoUrl || null,
      colorPrimary,
      colorSecondary,
      fontFamily,
      keywords, // מגיע כבר כמערך מהלקוח (מפוצל לפני השליחה)
    },
  });

  return NextResponse.json({ ok: true, business: updated });
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

  if (dbUser.role !== "owner") {
    return NextResponse.json({ error: "רק בעלים יכול להסיר עסק" }, { status: 403 });
  }

  const existing = await prisma.business.findFirst({
    where: { id, agencyId: dbUser.agencyId },
  });
  if (!existing) {
    return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 });
  }

  // schema.prisma מוגדר עם onDelete: Cascade על PhotoShoot, Ad, CalendarEntry
  // שמצביעים ל-Business — כלומר כל התמונות, הפרסומות, ורשומות התכנון
  // של העסק הזה יימחקו אוטומטית יחד איתו.
  await prisma.business.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}