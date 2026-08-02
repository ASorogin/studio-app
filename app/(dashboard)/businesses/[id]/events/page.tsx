// app/(dashboard)/businesses/[id]/events/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { getBusinessById, mockEvents } from "@/lib/mock-data";
import { BusinessSubNav } from "@/components/business-sub-nav";

const monthNames = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

export default async function BusinessEventsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = getBusinessById(id);
  if (!business) notFound();

  const relevantEvents = mockEvents
    .filter((e) => e.categories.includes(business.industry))
    .sort((a, b) => a.month - b.month || a.day - b.day);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">{business.name}</h2>
        <p className="font-util text-sm text-ink/60">מצב אירוע וחג</p>
      </div>
      <BusinessSubNav businessId={business.id} />

      {relevantEvents.length === 0 ? (
        <p className="rounded-card border border-dashed border-border bg-surface p-6 text-center font-body text-sm text-ink/50">
          אין אירועים רלוונטיים לתחום &quot;{business.industry}&quot; כרגע
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {relevantEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-card border border-border bg-surface p-4 shadow-card"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{event.emoji}</span>
                <div>
                  <h3 className="font-display text-sm font-semibold text-ink">{event.name}</h3>
                  <p className="flex items-center gap-1 font-util text-xs text-ink/50">
                    <CalendarDays className="h-3 w-3" />
                    {event.day} ב{monthNames[event.month - 1]}
                  </p>
                </div>
              </div>
              <Link
                href={`/businesses/${business.id}/generate`}
                className="rounded-sm bg-flash px-3 py-1.5 font-util text-xs font-semibold text-flash-ink hover:opacity-90"
              >
                יצירת פרסומת לאירוע
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}