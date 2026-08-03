// components/settings-form.tsx
"use client";

import { useState } from "react";
import { Check, UserPlus, Trash2, Loader2 } from "lucide-react";
import type { Agency, User } from "@prisma/client";

export function SettingsForm({
  agency,
  users: initialUsers,
  currentUserId,
}: {
  agency: Agency;
  users: User[];
  currentUserId: string;
}) {
  const [agencyForm, setAgencyForm] = useState({ name: agency.name, email: agency.email });
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState(initialUsers);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const isOwner = users.find((u) => u.id === currentUserId)?.role === "owner";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const res = await fetch("/api/agency", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(agencyForm),
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

  async function removeUser(id: string) {
    setRemovingId(id);
    const res = await fetch(`/api/agency/users/${id}`, { method: "DELETE" });
    setRemovingId(null);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "שגיאה בהסרת המשתמש");
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <>
      <form onSubmit={handleSave} className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6 shadow-card">
        <h3 className="font-display text-base font-semibold text-ink">פרטי סוכנות</h3>

        <label className="flex flex-col gap-1.5">
          <span className="font-util text-xs text-ink/60">שם הסוכנות</span>
          <input
            value={agencyForm.name}
            disabled={!isOwner}
            onChange={(e) => {
              setAgencyForm((p) => ({ ...p, name: e.target.value }));
              setSaved(false);
            }}
            className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo disabled:opacity-60"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-util text-xs text-ink/60">אימייל</span>
          <input
            value={agencyForm.email}
            disabled={!isOwner}
            onChange={(e) => {
              setAgencyForm((p) => ({ ...p, email: e.target.value }));
              setSaved(false);
            }}
            className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo disabled:opacity-60"
          />
        </label>

        {error && (
          <p className="rounded-sm bg-signal/10 px-3 py-2 font-util text-xs text-signal">{error}</p>
        )}

        {isOwner && (
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
        )}
      </form>

      <div className="mt-6 flex flex-col gap-4 rounded-card border border-border bg-surface p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-ink">חברי צוות</h3>
          <button
            type="button"
            disabled
            title="בקרוב"
            className="flex items-center gap-1.5 rounded-sm bg-paper-2 px-3 py-1.5 font-util text-xs font-medium text-ink/40"
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
                {user.role !== "owner" && isOwner && (
                  <button
                    type="button"
                    onClick={() => removeUser(user.id)}
                    disabled={removingId === user.id}
                    className="text-ink/30 hover:text-signal disabled:opacity-40"
                  >
                    {removingId === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}