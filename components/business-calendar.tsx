// components/business-calendar.tsx
"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { CalendarEntry } from "@/lib/mock-data";

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

const monthNames = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

export function BusinessCalendar({
  businessId,
  entries,
}: {
  businessId: string;
  entries: CalendarEntry[];
}) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(8); // 1-12, אוגוסט כברירת מחדל (יש לו נתוני mock)

  const entriesByDate = new Map(
    entries.filter((e) => e.businessId === businessId).map((e) => [e.date, e])
  );

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

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-card border border-border bg-surface p-4 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={goToPrevMonth}
            className="rounded-sm p-1.5 text-ink/60 hover:bg-paper-2 hover:text-ink"
            aria-label="חודש קודם"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <h3 className="font-display text-sm font-semibold text-ink">
            {monthNames[month - 1]} {year}
          </h3>

          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-sm p-1.5 text-ink/60 hover:bg-paper-2 hover:text-ink"
            aria-label="חודש הבא"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-2">
          {weekDays.map((d) => (
            <div key={d} className="text-center font-util text-xs text-ink/40">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const entry = entriesByDate.get(dateStr);
            const status = entry?.status ?? "empty";

            return (
              <div
                key={dateStr}
                className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-sm border font-util text-[10px] sm:text-xs ${statusStyles[status]}`}
              >
                <span className="font-semibold">{day}</span>
                {status !== "empty" && (
                  <span className="hidden text-[9px] sm:inline">{statusLabels[status]}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 font-util text-xs text-ink/60 sm:gap-4">
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