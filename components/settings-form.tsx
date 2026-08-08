// components/settings-form.tsx
"use client";

import { useState } from "react";
import { Check, UserPlus, Trash2, Loader2, Mail, X } from "lucide-react";
import type { Agency, User, AgencyInvite } from "@prisma/client";

export function SettingsForm({
  agency,
  users: initialUsers,
  currentUserId,
  pendingInvites: initialInvites,
}: {
  agency: Agency;
  users: User[];
  currentUserId: string;
  pendingInvites: AgencyInvite[];
}) {
  const [agencyForm, setAgencyForm] = useState({ name: agency.name, email: agency.email });
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState(initialUsers);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [invites, setInvites] = useState(initialInvites);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [cancelingInviteId, setCancelingInviteId] = useState<string | null>(null);

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

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setIsInviting(true);
    setInviteMessage(null);

    const res = await fetch("/api/agency/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    });

    setIsInviting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setInviteMessage(body.error ?? "שגיאה בהוספת ההזמנה");
      return;
    }

    const data = await res.json();
    setInvites((prev) => [...prev.filter((i) => i.email !== data.invite.email), data.invite]);
    setInviteEmail("");
    setInviteMessage(null);
  }

  async function cancelInvite(id: string) {
    setCancelingInviteId(id);
    const res = await fetch(`/api/agency/invite/${id}`, { method: "DELETE" });
    setCancelingInviteId(null);

    if (res.ok) {
      setInvites((prev) => prev.filter((i) => i.id !== id));
    }
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
          {isOwner && (
            <button
              type="button"
              onClick={() => setShowInviteForm((v) => !v)}
              className="flex items-center gap-1.5 rounded-sm bg-flash px-3 py-1.5 font-util text-xs font-semibold text-flash-ink hover:opacity-90"
            >
              {showInviteForm ? <X className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
              {showInviteForm ? "ביטול" : "הוספת חבר צוות"}
            </button>
          )}
        </div>

        {showInviteForm && (
          <form onSubmit={handleInvite} className="flex flex-col gap-2 rounded-sm border border-border bg-paper p-3">
            <label className="flex flex-col gap-1.5">
              <span className="font-util text-xs text-ink/60">
                כתובת אימייל של החבר/ה — הם יצטרפו אוטומטית לסוכנות כשירשמו ב-Studio עם המייל הזה
              </span>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="rounded-sm border border-border bg-surface px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
              />
            </label>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isInviting}
                className="flex items-center gap-2 rounded-sm bg-ink px-4 py-2 font-util text-sm font-semibold text-paper hover:opacity-90 disabled:opacity-50"
              >
                {isInviting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isInviting ? "מוסיף..." : "הוספה לרשימה"}
              </button>
              {inviteMessage && (
                <span className="font-util text-xs text-signal">{inviteMessage}</span>
              )}
            </div>
          </form>
        )}

        {invites.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="font-util text-xs text-ink/60">ממתינים להצטרפות</span>
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between rounded-sm border border-dashed border-border bg-paper px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-ink/40" />
                  <p className="font-body text-sm text-ink/70">{invite.email}</p>
                </div>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => cancelInvite(invite.id)}
                    disabled={cancelingInviteId === invite.id}
                    className="text-ink/30 hover:text-signal disabled:opacity-40"
                  >
                    {cancelingInviteId === invite.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

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