import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureAgencyForUser } from "@/lib/complete-signup";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  const result = await ensureAgencyForUser(user);
  return NextResponse.json({ ok: true, ...result });
}
