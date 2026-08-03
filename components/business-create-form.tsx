// components/business-create-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const fontOptions = ["Rubik", "Assistant", "IBM Plex Sans Hebrew"];

export function BusinessCreateForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    industry: "",
    colorPrimary: "#1C1620",
    colorSecondary: "#EFEDE4",
    fontFamily: "Rubik",
    keywords: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const res = await fetch("/api/businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        keywords: form.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      }),
    });

    const body = await res.json().catch(() => ({}));
    setIsSaving(false);

    if (!res.ok) {
      setError(body.error ?? "שגיאה ביצירת העסק");
      return;
    }

    router.push(`/businesses/${body.business.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6 shadow-card">
        <h3 className="font-display text-base font-semibold text-ink">פרטי עסק</h3>

        <Field label="שם העסק">
          <input
            required
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="לדוגמה: קפה הפינה"
            className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
          />
        </Field>

        <Field label="תחום">
          <input
            required
            value={form.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
            placeholder="לדוגמה: בית קפה"
            className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
          />
        </Field>

        <Field label="מילות מפתח (מופרדות בפסיק)">
          <input
            value={form.keywords}
            onChange={(e) => handleChange("keywords", e.target.value)}
            placeholder="קפה שחור, עבודה מהמחשב, קרואסון"
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

      <button
        type="submit"
        disabled={isSaving}
        className="flex w-fit items-center gap-2 rounded-sm bg-flash px-5 py-2 font-body text-sm font-semibold text-flash-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSaving ? "יוצר..." : "יצירת עסק"}
      </button>
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