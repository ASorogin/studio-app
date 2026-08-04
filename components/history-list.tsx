// components/history-list.tsx
"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, Check, Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import type { Ad, Business } from "@prisma/client";
import { AdCard } from "@/components/ad-card";
import { AdActions } from "@/components/ad-actions";

export function HistoryList({
  ads: initialAds,
  businesses,
  scheduledByAdId,
}: {
  ads: Ad[];
  businesses: Business[];
  scheduledByAdId: Record<string, string>;
}) {
  const [ads, setAds] = useState(initialAds);
  const [businessFilter, setBusinessFilter] = useState<string>("all");
  const [scheduled, setScheduled] = useState(scheduledByAdId);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Ad | null>(null);

  const businessesWithAds = useMemo(() => {
    const ids = new Set(ads.map((a) => a.businessId));
    return businesses.filter((b) => ids.has(b.id));
  }, [ads, businesses]);

  const filteredAds = useMemo(() => {
    const sorted = [...ads].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (businessFilter === "all") return sorted;
    return sorted.filter((ad) => ad.businessId === businessFilter);
  }, [ads, businessFilter]);

  function businessName(businessId: string) {
    return businesses.find((b) => b.id === businessId)?.name ?? "עסק לא ידוע";
  }

  function isFutureScheduled(adId: string) {
    const date = scheduled[adId];
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) >= today;
  }

  async function handleSchedule(ad: Ad, date: string) {
    if (!date) return;
    setSchedulingId(ad.id);
    const res = await fetch("/api/calendar-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: ad.businessId, adId: ad.id, date }),
    });
    setSchedulingId(null);
    if (res.ok) {
      setScheduled((prev) => ({ ...prev, [ad.id]: date }));
    }
  }

  async function performDelete(ad: Ad) {
    setDeletingId(ad.id);
    const res = await fetch(`/api/ads/${ad.id}`, { method: "DELETE" });
    setDeletingId(null);
    setConfirmTarget(null);
    if (res.ok) {
      setAds((prev) => prev.filter((a) => a.id !== ad.id));
    }
  }

  function handleDeleteClick(ad: Ad) {
    if (isFutureScheduled(ad.id)) {
      setConfirmTarget(ad);
    } else {
      performDelete(ad);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setBusinessFilter("all")}
          className={`rounded-sm px-3 py-1.5 font-util text-xs transition-colors ${
            businessFilter === "all" ? "bg-ink font-semibold text-paper" : "bg-paper-2 text-ink/60 hover:text-ink"
          }`}
        >
          הכל
        </button>
        {businessesWithAds.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setBusinessFilter(b.id)}
            className={`rounded-sm px-3 py-1.5 font-util text-xs transition-colors ${
              businessFilter === b.id ? "bg-ink font-semibold text-paper" : "bg-paper-2 text-ink/60 hover:text-ink"
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {filteredAds.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border bg-surface py-16 text-center">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-8 w-8 rounded-sm border-2 border-border" />
            ))}
          </div>
          <p className="font-body text-sm text-ink/60">אין פרסומות שתואמות לסינון</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredAds.map((ad) => (
            <div key={ad.id} className="flex flex-col gap-1.5">
              <AdCard ad={ad} />
              <span className="font-util text-[11px] text-ink/50">{businessName(ad.businessId)}</span>
              <AdActions imageUrl={ad.outputImageUrl} headline={ad.headline} caption={ad.caption} />
              {scheduled[ad.id] ? (
                <span className="flex items-center gap-1.5 rounded-sm bg-success/10 px-2.5 py-1.5 font-util text-xs text-success">
                  <Check className="h-3.5 w-3.5" />
                  מתוזמן ל-{new Date(scheduled[ad.id]).toLocaleDateString("he-IL")}
                </span>
              ) : (
                <label className="flex items-center gap-1.5 rounded-sm border border-border bg-paper px-2.5 py-1.5">
                  <CalendarPlus className="h-3.5 w-3.5 shrink-0 text-ink/50" />
                  <input
                    type="date"
                    disabled={schedulingId === ad.id}
                    onChange={(e) => handleSchedule(ad, e.target.value)}
                    className="w-full bg-transparent font-util text-xs text-ink/70 outline-none"
                  />
                </label>
              )}
              <button
                type="button"
                onClick={() => handleDeleteClick(ad)}
                disabled={deletingId === ad.id}
                className="flex items-center justify-center gap-1 rounded-sm px-2.5 py-1.5 font-util text-xs text-ink/40 hover:bg-signal/10 hover:text-signal disabled:opacity-40"
              >
                {deletingId === ad.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                מחיקה
              </button>
            </div>
          ))}
        </div>
      )}

      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setConfirmTarget(null)}>
          <div
            className="w-full max-w-sm rounded-card border border-border bg-surface p-6 shadow-card-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-signal" />
                <h3 className="font-display text-base font-semibold text-ink">למחוק פרסומת מתוזמנת?</h3>
              </div>
              <button type="button" onClick={() => setConfirmTarget(null)} className="text-ink/40 hover:text-ink" aria-label="סגירה">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-5 font-body text-sm text-ink/60">
              הפרסומת &quot;{confirmTarget.headline}&quot; מתוזמנת ל-
              {new Date(scheduled[confirmTarget.id]).toLocaleDateString("he-IL")} — תאריך שעדיין לא עבר. מחיקה תסיר אותה גם מלוח התוכן.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                className="rounded-sm px-4 py-2 font-util text-sm text-ink/60 hover:text-ink"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={() => performDelete(confirmTarget)}
                className="rounded-sm bg-signal px-4 py-2 font-util text-sm font-semibold text-white hover:opacity-90"
              >
                כן, למחוק
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}