// app/(dashboard)/settings/page.tsx
"use client";

import { useState } from "react";
import { Check, UserPlus, Trash2 } from "lucide-react";
import { mockAgency, mockUsers } from "@/lib/mock-data";

export default function SettingsPage() {
  const [agencyForm, setAgencyForm] = useState({
    name: mockAgency.name,
    email: mockAgency.email,
  });
  const [saved, setSaved] = useState(false);
  const [users, setUsers] = useState(mockUsers);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function removeUser(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">הגדרות חשבון</h2>
        <p className="font-util text-sm text-ink/60">פרטי הסוכנות וניהול צוות</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6 shadow-card">
        <h3 className="font-display text-base font-semibold text-ink">פרטי סוכנות</h3>

        <label className="flex flex-col gap-1.5">
          <span className="font-util text-xs text-ink/60">שם הסוכנות</span>
          <input
            value={agencyForm.name}
            onChange={(e) => {
              setAgencyForm((p) => ({ ...p, name: e.target.value }));
              setSaved(false);
            }}
            className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-util text-xs text-ink/60">אימייל</span>
          <input
            value={agencyForm.email}
            onChange={(e) => {
              setAgencyForm((p) => ({ ...p, email: e.target.value }));
              setSaved(false);
            }}
            className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-sm bg-flash px-5 py-2 font-body text-sm font-semibold text-flash-ink transition-opacity hover:opacity-90"
          >
            שמירת שינויים
          </button>
          {saved && (
            <span className="flex items-center gap-1 font-util text-sm text-success">
              <Check className="h-4 w-4" />
              נשמר (מקומית)
            </span>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-ink">חברי צוות</h3>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-sm bg-paper-2 px-3 py-1.5 font-util text-xs font-medium text-ink/70 hover:text-ink"
          >
            <UserPlus className="h-3.5 w-3.5" />
            הזמנת חבר צוות
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-sm border border-border bg-paper px-3 py-2"
            >
              <div>
                <p className="font-body text-sm text-ink">{user.name}</p>
                <p className="font-util text-xs text-ink/50">{user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-sm bg-indigo/10 px-2 py-0.5 font-util text-[10px] font-medium text-indigo">
                  {user.role === "owner" ? "בעלים" : "עורך"}
                </span>
                {user.role !== "owner" && (
                  <button
                    type="button"
                    onClick={() => removeUser(user.id)}
                    className="text-ink/30 hover:text-signal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}