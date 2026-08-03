// app/api/agency/users/[userId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "owner") {
    return NextResponse.json({ error: "רק בעלים יכול להסיר חברי צוות" }, { status: 403 });
  }

  const target = await prisma.user.findFirst({
    where: { id: userId, agencyId: dbUser.agencyId },
  });
  if (!target) {
    return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
  }
  if (target.role === "owner") {
    return NextResponse.json({ error: "לא ניתן להסיר את הבעלים" }, { status: 400 });
  }

  // ⚠️ TODO (שלב מאוחר יותר): זה מוחק רק את שורת ה-User שלנו ב-DB.
  // המשתמש עדיין קיים ב-Supabase Auth ויוכל עדיין להתחבר — פשוט בלי
  // שורת User תואמת, מה שישבור זרימות שמצפות לה (כמו לוח הבקרה).
  // מחיקה מלאה דורשת גם קריאה ל-Supabase Admin API (service_role key)
  // כדי למחוק את המשתמש גם מ-auth.users. לא ממומש עדיין.
  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ ok: true });
}