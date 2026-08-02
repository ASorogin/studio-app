// app/(dashboard)/history/page.tsx
"use client";

import { useState, useMemo } from "react";
import { mockAds, mockBusinesses } from "@/lib/mock-data";
import { AdCard } from "@/components/ad-card";

export default function HistoryPage() {
  const [businessFilter, setBusinessFilter] = useState<string>("all");

  const businessesWithAds = useMemo(() => {
    const ids = new Set(mockAds.map((a) => a.businessId));
    return mockBusinesses.filter((b) => ids.has(b.id));
  }, []);

  const filteredAds = useMemo(() => {
    const sorted = [...mockAds].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (businessFilter === "all") return sorted;
    return sorted.filter((ad) => ad.businessId === businessFilter);
  }, [businessFilter]);

  function businessName(businessId: string) {
    return mockBusinesses.find((b) => b.id === businessId)?.name ?? "עסק לא ידוע";
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">היסטוריית פרסומות</h2>
        <p className="font-util text-sm text-ink/60">{filteredAds.length} פרסומות</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setBusinessFilter("all")}
          className={`rounded-sm px-3 py-1.5 font-util text-xs transition-colors ${
            businessFilter === "all"
              ? "bg-ink font-semibold text-paper"
              : "bg-paper-2 text-ink/60 hover:text-ink"
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
              businessFilter === b.id
                ? "bg-ink font-semibold text-paper"
                : "bg-paper-2 text-ink/60 hover:text-ink"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}