// app/api/ads/generate-copy-suggestions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { generateCopySuggestions } from "@/lib/ai-copy";

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

  const { businessId, format, rawIdea, creativeAngle, eventId } = await request.json();

  if (!rawIdea || !rawIdea.trim()) {
    return NextResponse.json({ error: "יש להזין רעיון לפרסומת" }, { status: 400 });
  }

  const business = await prisma.business.findFirst({
    where: { id: businessId, agencyId: dbUser.agencyId },
  });
  if (!business) {
    return NextResponse.json({ error: "עסק לא נמצא" }, { status: 404 });
  }

  const event = eventId ? await prisma.event.findUnique({ where: { id: eventId } }) : null;

  try {
    const suggestions = await generateCopySuggestions({
      business,
      format,
      rawIdea,
      creativeAngle: creativeAngle ?? "auto",
      event,
    });
    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("שגיאה ביצירת הצעות טקסט:", err);
    return NextResponse.json({ error: "שגיאה ביצירת הצעות טקסט" }, { status: 500 });
  }
}