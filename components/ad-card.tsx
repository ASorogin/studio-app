// components/ad-card.tsx
import { ImageIcon } from "lucide-react";
import type { Ad } from "@/lib/mock-data";

const formatLabels: Record<Ad["format"], string> = {
  feed: "פיד",
  story: "סטורי",
  reel: "ריל",
};

export function AdCard({ ad }: { ad: Ad }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card">
      <div className="flex aspect-[4/5] items-center justify-center bg-paper-2">
        <ImageIcon className="h-8 w-8 text-ink/20" />
      </div>
      <div className="flex flex-col gap-1.5 p-3">
        <span className="w-fit rounded-sm bg-indigo/10 px-2 py-0.5 font-util text-[10px] font-medium text-indigo">
          {formatLabels[ad.format]}
        </span>
        <h4 className="line-clamp-1 font-display text-sm font-semibold text-ink">{ad.headline}</h4>
        <p className="line-clamp-2 font-body text-xs text-ink/60">{ad.caption}</p>
      </div>
    </div>
  );
}