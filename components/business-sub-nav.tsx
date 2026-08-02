// components/business-sub-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { segment: "", label: "פרופיל" },
  { segment: "photos", label: "תמונות" },
  { segment: "generate", label: "יצירת פרסומת" },
  { segment: "events", label: "אירועים" },
  { segment: "calendar", label: "תכנון תוכן" },
];

export function BusinessSubNav({ businessId }: { businessId: string }) {
  const pathname = usePathname();
  const base = `/businesses/${businessId}`;

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map(({ segment, label }) => {
        const href = segment ? `${base}/${segment}` : base;
        const isActive = pathname === href;
        return (
          <Link
            key={segment}
            href={href}
            className={`shrink-0 whitespace-nowrap px-3 py-2 font-util text-sm transition-colors ${
              isActive
                ? "border-b-2 border-flash font-semibold text-ink"
                : "text-ink/50 hover:text-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}