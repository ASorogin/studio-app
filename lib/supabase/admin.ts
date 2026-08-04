// lib/supabase/admin.ts
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ⚠️ שימוש ב-service_role key — עוקף לגמרי RLS. לעולם לא לייבא
// את הקובץ הזה מקוד שרץ בדפדפן (רק מ-API routes / Server Components).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}