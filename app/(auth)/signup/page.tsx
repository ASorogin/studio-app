// app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Film } from "lucide-react";

export default function SignupPage() {
  const [form, setForm] = useState({ agencyName: "", email: "", password: "" });

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Stage 1: UI only — no real Supabase Auth call yet (Stage 2).
    alert("הרשמה תיפעל אחרי חיבור Supabase Auth בשלב 2");
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

        <button
          type="submit"
          className="mt-2 rounded-sm bg-flash px-4 py-2.5 font-body text-sm font-semibold text-flash-ink transition-opacity hover:opacity-90"
        >
          יצירת חשבון
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