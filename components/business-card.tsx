// components/business-card.tsx
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import type { Business } from "@prisma/client";

export function BusinessCard({ business }: { business: Business }) {
  return (
    <Link
      href={`/businesses/${business.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card transition-shadow hover:shadow-card-lg"
    >
      <div
        className="flex h-24 items-center justify-center"
        style={{ backgroundColor: business.colorPrimary }}
      >
        {business.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.logoUrl} alt={business.name} className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full font-display text-lg font-bold"
            style={{ backgroundColor: business.colorSecondary, color: business.colorPrimary }}
          >
            {business.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">{business.name}</h3>
          <p className="font-util text-xs text-ink/60">{business.industry}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {business.keywords.slice(0, 2).map((kw) => (
            <span
              key={kw}
              className="rounded-sm bg-paper-2 px-2 py-0.5 font-util text-[11px] text-ink/70"
            >
              {kw}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-ink/50">
          <ImageIcon className="h-3.5 w-3.5" />
          <span className="font-util">צפה בעסק</span>
        </div>
      </div>
    </Link>
  );
}