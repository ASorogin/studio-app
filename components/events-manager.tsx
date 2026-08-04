// components/events-manager.tsx
"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, X } from "lucide-react";
import type { Event } from "@prisma/client";

const monthNames = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

const emptyForm = { name: "", emoji: "📅", type: "holiday", month: "1", day: "1", categories: "" };

export function EventsManager({ events: initialEvents, agencyId }: { events: Event[]; agencyId: string }) {
  const [events, setEvents] = useState(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const sorted = [...events].sort((a, b) => a.month - b.month || a.day - b.day);

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        categories: form.categories.split(",").map((c) => c.trim()).filter(Boolean),
      }),
    });

    setIsSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "שגיאה בהוספת האירוע");
      return;
    }

    const data = await res.json();
    setEvents((prev) => [...prev, data.event]);
    setForm(emptyForm);
    setShowForm(false);
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    setRemovingId(null);
    if (res.ok) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-util text-sm text-ink/60">{sorted.length} אירועים</span>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-sm bg-flash px-3 py-1.5 font-util text-xs font-semibold text-flash-ink hover:opacity-90"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? "ביטול" : "הוספת אירוע"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className="flex flex-col gap-1">
              <span className="font-util text-xs text-ink/60">שם</span>
              <input
                required
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="rounded-sm border border-border bg-paper px-2.5 py-1.5 font-body text-sm text-ink outline-none focus:border-indigo"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-util text-xs text-ink/60">אימוגי</span>
              <input
                value={form.emoji}
                onChange={(e) => handleChange("emoji", e.target.value)}
                maxLength={4}
                className="rounded-sm border border-border bg-paper px-2.5 py-1.5 font-body text-sm text-ink outline-none focus:border-indigo"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-util text-xs text-ink/60">סוג</span>
              <select
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="rounded-sm border border-border bg-paper px-2.5 py-1.5 font-body text-sm text-ink outline-none focus:border-indigo"
              >
                <option value="holiday">חג</option>
                <option value="international_day">יום בינלאומי</option>
              </select>
            </label>
            <div className="flex gap-2">
              <label className="flex flex-1 flex-col gap-1">
                <span className="font-util text-xs text-ink/60">חודש</span>
                <select
                  value={form.month}
                  onChange={(e) => handleChange("month", e.target.value)}
                  className="rounded-sm border border-border bg-paper px-2.5 py-1.5 font-body text-sm text-ink outline-none focus:border-indigo"
                >
                  {monthNames.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </label>
              <label className="flex w-16 flex-col gap-1">
                <span className="font-util text-xs text-ink/60">יום</span>
                <input
                  type="number"
                  min={1}
                  max={31}
                  required
                  value={form.day}
                  onChange={(e) => handleChange("day", e.target.value)}
                  className="rounded-sm border border-border bg-paper px-2.5 py-1.5 font-body text-sm text-ink outline-none focus:border-indigo"
                />
              </label>
            </div>
          </div>

          <label className="flex flex-col gap-1">
            <span className="font-util text-xs text-ink/60">תחומים רלוונטיים (מופרדים בפסיק, כמו בשדה תחום בעסק)</span>
            <input
              value={form.categories}
              onChange={(e) => handleChange("categories", e.target.value)}
              placeholder="מסעדה, בית קפה, פיצרייה"
              className="rounded-sm border border-border bg-paper px-2.5 py-1.5 font-body text-sm text-ink outline-none focus:border-indigo"
            />
          </label>

          {error && <p className="rounded-sm bg-signal/10 px-3 py-2 font-util text-xs text-signal">{error}</p>}

          <button
            type="submit"
            disabled={isSaving}
            className="flex w-fit items-center gap-2 rounded-sm bg-ink px-4 py-2 font-util text-sm font-semibold text-paper hover:opacity-90 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving ? "מוסיף..." : "הוספה"}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {sorted.map((event) => {
          const isCustom = event.agencyId === agencyId;
          return (
            <div key={event.id} className="flex items-center justify-between rounded-sm border border-border bg-surface px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">{event.emoji}</span>
                <div>
                  <p className="font-body text-sm text-ink">{event.name}</p>
                  <p className="font-util text-xs text-ink/50">
                    {event.day} ב{monthNames[event.month - 1]}
                    {event.categories.length > 0 && ` · ${event.categories.join(", ")}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-sm px-2 py-0.5 font-util text-[10px] font-medium ${
                    isCustom ? "bg-indigo/10 text-indigo" : "bg-paper-2 text-ink/50"
                  }`}
                >
                  {isCustom ? "מותאם אישית" : "מובנה"}
                </span>
                {isCustom && (
                  <button
                    type="button"
                    onClick={() => handleRemove(event.id)}
                    disabled={removingId === event.id}
                    className="text-ink/30 hover:text-signal disabled:opacity-40"
                  >
                    {removingId === event.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}