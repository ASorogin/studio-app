import { prisma } from "@/lib/prisma";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export async function ensureAgencyForUser(user: SupabaseUser) {
  if (!user.email) {
    throw new Error("למשתמש אין כתובת אימייל");
  }

  const existingUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (existingUser) {
    return { alreadyExists: true, agencyId: existingUser.agencyId };
  }

  const agencyName = (user.user_metadata?.agency_name as string | undefined) || "סוכנות חדשה";

  const agency = await prisma.agency.create({
    data: {
      name: agencyName,
      email: user.email,
      plan: "free",
      users: {
        create: {
          id: user.id,
          name: user.email.split("@")[0],
          email: user.email,
          role: "owner",
        },
      },
    },
  });

  return { alreadyExists: false, agencyId: agency.id };
}
