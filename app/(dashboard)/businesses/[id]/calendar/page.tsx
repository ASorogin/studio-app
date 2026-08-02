// app/(dashboard)/businesses/[id]/calendar/page.tsx
import { notFound } from "next/navigation";
import { getBusinessById, mockCalendarEntries } from "@/lib/mock-data";
import { BusinessSubNav } from "@/components/business-sub-nav";
import { BusinessCalendar } from "@/components/business-calendar";

export default async function BusinessCalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = getBusinessById(id);
  if (!business) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">{business.name}</h2>
        <p className="font-util text-sm text-ink/60">תכנון תוכן</p>
      </div>
      <BusinessSubNav businessId={business.id} />
      <BusinessCalendar businessId={business.id} entries={mockCalendarEntries} />
    </div>
  );
}