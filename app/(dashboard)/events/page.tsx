// app/(dashboard)/events/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { EventsManager } from "@/components/events-manager";

export default async function EventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) notFound();

  const events = await prisma.event.findMany({
    where: {
      OR: [{ agencyId: null }, { agencyId: dbUser.agencyId }],
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">חגים ואירועים</h2>
        <p className="font-util text-sm text-ink/60">
          ניהול רשימת האירועים שמוצגים לעסקים שלך לפי תחום
        </p>
      </div>
      <EventsManager events={events} agencyId={dbUser.agencyId} />
    </div>
  );
}