// components/business-calendar.tsx
"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, X, Trash2, Loader2 } from "lucide-react";
import type { CalendarEntry, Ad } from "@prisma/client";
import { AdActions } from "@/components/ad-actions";

type EntryWithAd = CalendarEntry & { ad: Ad | null };

const weekDays = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];

const monthNames = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

const formatLabels: Record<string, string> = { feed: "פיד", story: "סטורי", reel: "ריל" };

export function BusinessCalendar({
  entries,
}: {
  entries: EntryWithAd[];
}) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(8);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [localEntries, setLocalEntries] = useState(entries);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const entriesByDate = new Map<string, EntryWithAd[]>();
  for (const entry of localEntries) {
    const key = entry.date.toISOString().slice(0, 10);
    const list = entriesByDate.get(key) ?? [];
    list.push(entry);
    entriesByDate.set(key, list);
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function goToPrevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  async function handleRemove(entryId: string) {
    setRemovingId(entryId);
    const res = await fetch(`/api/calendar-entries/${entryId}`, { method: "DELETE" });
    setRemovingId(null);
    if (res.ok) {
      setLocalEntries((prev) => prev.filter((e) => e.id !== entryId));
    }
  }

  const selectedEntries = selectedDate ? entriesByDate.get(selectedDate) ?? [] : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-card border border-border bg-surface p-4 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={goToPrevMonth} className="rounded-sm p-1.5 text-ink/60 hover:bg-paper-2 hover:text-ink" aria-label="חודש קודם">
            <ChevronRight className="h-4 w-4" />
          </button>
          <h3 className="font-display text-sm font-semibold text-ink">{monthNames[month - 1]} {year}</h3>
          <button type="button" onClick={goToNextMonth} className="rounded-sm p-1.5 text-ink/60 hover:bg-paper-2 hover:text-ink" aria-label="חודש הבא">
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-2">
          {weekDays.map((d) => (
            <div key={d} className="text-center font-util text-xs text-ink/40">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEntries = entriesByDate.get(dateStr) ?? [];
            const hasContent = dayEntries.length > 0;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={`relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-sm border font-util text-[10px] transition-colors sm:text-xs ${
                  hasContent
                    ? "border-success/30 bg-success/15 text-success hover:bg-success/25"
                    : "border-border bg-paper-2 text-ink/30 hover:bg-paper"
                }`}
              >
                <span className="font-semibold">{day}</span>
                {hasContent && (
                  <span className="absolute top-1 left-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-success px-1 text-[9px] font-semibold text-white">
                    {dayEntries.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 font-util text-xs text-ink/60 sm:gap-4">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-success" />
          יש תוכן מתוכנן (המספר = כמות פוסטים)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-border bg-paper-2" />
          ריק
        </span>
      </div>

      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedDate(null)}>
          <div
            className="flex max-h-[80vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-card border border-border bg-surface p-6 shadow-card-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-ink">
                {new Date(selectedDate).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}
              </h3>
              <button type="button" onClick={() => setSelectedDate(null)} className="text-ink/40 hover:text-ink" aria-label="סגירה">
                <X className="h-4 w-4" />
              </button>
            </div>

            {selectedEntries.length === 0 ? (
              <p className="rounded-card border border-dashed border-border bg-paper p-6 text-center font-body text-sm text-ink/50">
                אין תוכן מתוכנן ליום הזה
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedEntries.map((entry) => (
                  <div key={entry.id} className="flex gap-3 rounded-sm border border-border bg-paper p-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-paper-2">
                      {entry.ad?.outputImageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={entry.ad.outputImageUrl} alt={entry.ad.headline} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5">
                      <span className="w-fit rounded-sm bg-indigo/10 px-1.5 py-0.5 font-util text-[10px] font-medium text-indigo">
                        {entry.ad ? formatLabels[entry.ad.format] : ""}
                      </span>
                      <p className="line-clamp-1 font-display text-sm font-semibold text-ink">{entry.ad?.headline}</p>
                      <p className="line-clamp-2 font-body text-xs text-ink/60">{entry.ad?.caption}</p>
                      {entry.ad && (
                        <AdActions
                          imageUrl={entry.ad.outputImageUrl}
                          headline={entry.ad.headline}
                          caption={entry.ad.caption}
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(entry.id)}
                      disabled={removingId === entry.id}
                      className="self-start text-ink/30 hover:text-signal disabled:opacity-40"
                      aria-label="הסרה מהתכנון"
                    >
                      {removingId === entry.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}