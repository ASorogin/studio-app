// app/(dashboard)/settings/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) notFound();

  const agency = await prisma.agency.findUnique({ where: { id: dbUser.agencyId } });
  if (!agency) notFound();

  const users = await prisma.user.findMany({
    where: { agencyId: dbUser.agencyId },
    orderBy: { createdAt: "asc" },
  });

  const pendingInvites = await prisma.agencyInvite.findMany({
    where: { agencyId: dbUser.agencyId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">הגדרות חשבון</h2>
        <p className="font-util text-sm text-ink/60">פרטי הסוכנות וניהול צוות</p>
      </div>

      <SettingsForm
        agency={agency}
        users={users}
        currentUserId={dbUser.id}
        pendingInvites={pendingInvites}
      />
    </div>
  );
}