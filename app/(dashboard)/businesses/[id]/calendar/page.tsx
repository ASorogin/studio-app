// app/(dashboard)/businesses/[id]/calendar/page.tsx
import { notFound } from "next/navigation";
import { getBusinessById, mockCalendarEntries } from "@/lib/mock-data";
import { BusinessSubNav } from "@/components/business-sub-nav";

const statusStyles: Record<string, string> = {
  ready: "bg-success/15 text-success border-success/30",
  planned: "bg-indigo/10 text-indigo border-indigo/30",
  empty: "bg-paper-2 text-ink/30 border-border",
};

const statusLabels: Record<string, string> = {
  ready: "מוכן",
  planned: "מתוכנן",
  empty: "",
};

const weekDays = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];

export default async function BusinessCalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = getBusinessById(id);
  if (!business) notFound();

  const entries = mockCalendarEntries.filter((e) => e.businessId === id);
  const entriesByDate = new Map(entries.map((e) => [e.date, e]));

  const year = 2026;
  const month = 8; // אוגוסט
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">{business.name}</h2>
        <p className="font-util text-sm text-ink/60">תכנון תוכן — אוגוסט 2026</p>
      </div>
      <BusinessSubNav businessId={business.id} />

      <div className="rounded-card border border-border bg-surface p-4 shadow-card">
        <div className="mb-2 grid grid-cols-7 gap-2">
          {weekDays.map((d) => (
            <div key={d} className="text-center font-util text-xs text-ink/40">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const dateStr = `${year}-08-${String(day).padStart(2, "0")}`;
            const entry = entriesByDate.get(dateStr);
            const status = entry?.status ?? "empty";

            return (
              <div
                key={dateStr}
                className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-sm border font-util text-xs ${statusStyles[status]}`}
              >
                <span className="font-semibold">{day}</span>
                {status !== "empty" && <span className="text-[9px]">{statusLabels[status]}</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4 font-util text-xs text-ink/60">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-success" />
          מוכן
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo" />
          מתוכנן
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-border bg-paper-2" />
          ריק
        </span>
      </div>
    </div>
  );
}