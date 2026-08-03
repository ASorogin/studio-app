// components/business-profile-form.tsx
"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { Business } from "@prisma/client";

const fontOptions = ["Rubik", "Assistant", "IBM Plex Sans Hebrew"];

export function BusinessProfileForm({ business }: { business: Business }) {
  const [form, setForm] = useState({
    name: business.name,
    industry: business.industry,
    logoUrl: business.logoUrl ?? "",
    colorPrimary: business.colorPrimary,
    colorSecondary: business.colorSecondary,
    fontFamily: business.fontFamily,
    keywords: business.keywords.join(", "),
  });
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const res = await fetch(`/api/businesses/${business.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        industry: form.industry,
        logoUrl: form.logoUrl,
        colorPrimary: form.colorPrimary,
        colorSecondary: form.colorSecondary,
        fontFamily: form.fontFamily,
        keywords: form.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      }),
    });

    setIsSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "שגיאה בשמירה");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form onSubmit={handleSave} className="flex max-w-2xl flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6 shadow-card">
        <h3 className="font-display text-base font-semibold text-ink">פרטי עסק</h3>

        <Field label="שם העסק">
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
          />
        </Field>

        <Field label="תחום">
          <input
            value={form.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
            className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
          />
        </Field>

        <Field label="מילות מפתח (מופרדות בפסיק)">
          <input
            value={form.keywords}
            onChange={(e) => handleChange("keywords", e.target.value)}
            className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
          />
        </Field>

        <Field label="קישור ללוגו (URL)">
          <input
            value={form.logoUrl}
            onChange={(e) => handleChange("logoUrl", e.target.value)}
            placeholder="https://..."
            className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
          />
        </Field>
      </section>

      <section className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6 shadow-card">
        <h3 className="font-display text-base font-semibold text-ink">מיתוג</h3>

        <div className="grid grid-cols-2 gap-4">
          <Field label="צבע ראשי">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.colorPrimary}
                onChange={(e) => handleChange("colorPrimary", e.target.value)}
                className="h-9 w-9 cursor-pointer rounded-sm border border-border bg-transparent"
              />
              <input
                value={form.colorPrimary}
                onChange={(e) => handleChange("colorPrimary", e.target.value)}
                className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-util text-sm text-ink outline-none focus:border-indigo"
              />
            </div>
          </Field>

          <Field label="צבע משני">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.colorSecondary}
                onChange={(e) => handleChange("colorSecondary", e.target.value)}
                className="h-9 w-9 cursor-pointer rounded-sm border border-border bg-transparent"
              />
              <input
                value={form.colorSecondary}
                onChange={(e) => handleChange("colorSecondary", e.target.value)}
                className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-util text-sm text-ink outline-none focus:border-indigo"
              />
            </div>
          </Field>
        </div>

        <Field label="גופן">
          <select
            value={form.fontFamily}
            onChange={(e) => handleChange("fontFamily", e.target.value)}
            className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
          >
            {fontOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
      </section>

      {error && (
        <p className="rounded-sm bg-signal/10 px-3 py-2 font-util text-xs text-signal">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 rounded-sm bg-flash px-5 py-2 font-body text-sm font-semibold text-flash-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSaving ? "שומר..." : "שמירת שינויים"}
        </button>
        {saved && (
          <span className="flex items-center gap-1 font-util text-sm text-success">
            <Check className="h-4 w-4" />
            נשמר בהצלחה
          </span>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-util text-xs text-ink/60">{label}</span>
      {children}
    </label>
  );
}