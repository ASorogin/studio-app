// app/(dashboard)/businesses/[id]/calendar/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { BusinessSubNav } from "@/components/business-sub-nav";
import { BusinessCalendar } from "@/components/business-calendar";

export default async function BusinessCalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) notFound();

  const business = await prisma.business.findFirst({
    where: { id, agencyId: dbUser.agencyId },
  });
  if (!business) notFound();

  const entries = await prisma.calendarEntry.findMany({
    where: { businessId: id },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">{business.name}</h2>
        <p className="font-util text-sm text-ink/60">תכנון תוכן</p>
      </div>
      <BusinessSubNav businessId={business.id} />
      <BusinessCalendar businessId={business.id} entries={entries} />
    </div>
  );
}