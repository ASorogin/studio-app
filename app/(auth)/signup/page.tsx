// app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Film, Loader2, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [form, setForm] = useState({ agencyName: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { agency_name: form.agencyName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setIsLoading(false);
      setError(authError.message);
      return;
    }

    // אם "Confirm email" כבוי (פיתוח) — signUp מחזיר session מיד, אפשר
    // ליצור את הסוכנות כאן. אם דלוק (production) — אין session עדיין,
    // וזה יקרה אוטומטית ב-/auth/callback אחרי לחיצה על הקישור במייל.
    if (data.session) {
      const res = await fetch("/api/auth/complete-signup", { method: "POST" });
      setIsLoading(false);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "שגיאה ביצירת הסוכנות");
        return;
      }
    } else {
      setIsLoading(false);
    }

    setSubmitted(true);
  }
  
  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-white/10 bg-surface p-8 text-center shadow-lg">
        <MailCheck className="h-8 w-8 text-success" />
        <h1 className="font-display text-lg font-bold text-ink">כמעט סיימנו</h1>
        <p className="font-body text-sm text-ink/60">
          שלחנו מייל אימות ל-{form.email}. יש ללחוץ על הקישור כדי להשלים את ההרשמה.
        </p>
        <Link href="/login" className="mt-2 font-util text-xs text-indigo hover:underline">
          חזרה להתחברות
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-card border border-white/10 bg-surface p-8 shadow-lg">
      <div className="flex flex-col items-center gap-2">
        <Film className="h-7 w-7 text-flash" />
        <h1 className="font-display text-xl font-bold text-ink">יצירת חשבון סוכנות</h1>
        <p className="font-util text-xs text-ink/50">30 יום ניסיון חינם, ללא כרטיס אשראי</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-util text-xs text-ink/60">שם הסוכנות</span>
          <input
            required
            value={form.agencyName}
            onChange={(e) => handleChange("agencyName", e.target.value)}
            placeholder="הסוכנות שלי"
            className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-util text-xs text-ink/60">אימייל</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="you@agency.co.il"
            className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-util text-xs text-ink/60">סיסמה</span>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="לפחות 8 תווים"
            className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
          />
        </label>

        {error && (
          <p className="rounded-sm bg-signal/10 px-3 py-2 font-util text-xs text-signal">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex items-center justify-center gap-2 rounded-sm bg-flash px-4 py-2.5 font-body text-sm font-semibold text-flash-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? "יוצר חשבון..." : "יצירת חשבון"}
        </button>
      </form>

      <p className="text-center font-util text-xs text-ink/50">
        כבר יש לך חשבון?{" "}
        <Link href="/login" className="font-medium text-indigo hover:underline">
          התחברות
        </Link>
      </p>
    </div>
  );
}