// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Film } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Stage 1: UI only — no real Supabase Auth call yet (Stage 2).
    alert("התחברות תיפעל אחרי חיבור Supabase Auth בשלב 2");
  }

  return (
    <div className="flex flex-col gap-6 rounded-card border border-white/10 bg-surface p-8 shadow-lg">
      <div className="flex flex-col items-center gap-2">
        <Film className="h-7 w-7 text-flash" />
        <h1 className="font-display text-xl font-bold text-ink">התחברות ל-Studio</h1>
        <p className="font-util text-xs text-ink/50">ניהול הפרסומות של הסוכנות שלך</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-util text-xs text-ink/60">אימייל</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@agency.co.il"
            className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-util text-xs text-ink/60">סיסמה</span>
            <Link href="#" className="font-util text-xs text-indigo hover:underline">
              שכחת סיסמה?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
          />
        </label>

        <button
          type="submit"
          className="mt-2 rounded-sm bg-flash px-4 py-2.5 font-body text-sm font-semibold text-flash-ink transition-opacity hover:opacity-90"
        >
          התחברות
        </button>
      </form>

      <p className="text-center font-util text-xs text-ink/50">
        אין לך חשבון?{" "}
        <Link href="/signup" className="font-medium text-indigo hover:underline">
          הרשמה
        </Link>
      </p>
    </div>
  );
}