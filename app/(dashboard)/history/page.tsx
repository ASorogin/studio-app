// app/(dashboard)/history/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { HistoryList } from "@/components/history-list";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) notFound();

  const businesses = await prisma.business.findMany({
    where: { agencyId: dbUser.agencyId },
  });
  const businessIds = businesses.map((b) => b.id);

  const ads = await prisma.ad.findMany({
    where: { businessId: { in: businessIds } },
  });

  const calendarEntries = await prisma.calendarEntry.findMany({
    where: { businessId: { in: businessIds }, adId: { not: null } },
  });
  const scheduledByAdId: Record<string, string> = {};
  for (const entry of calendarEntries) {
    if (entry.adId) scheduledByAdId[entry.adId] = entry.date.toISOString().slice(0, 10);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">היסטוריית פרסומות</h2>
        <p className="font-util text-sm text-ink/60">{ads.length} פרסומות</p>
      </div>
      <HistoryList ads={ads} businesses={businesses} scheduledByAdId={scheduledByAdId} />
    </div>
  );
}