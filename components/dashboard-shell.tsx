// components/dashboard-shell.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import type { PlanTier } from "@prisma/client";
import { Sidebar } from "@/components/sidebar";
import { LogoutButton } from "@/components/logout-button";

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "לוח בקרה";
  if (pathname.startsWith("/history")) return "היסטוריית פרסומות";
  if (pathname.startsWith("/events")) return "חגים ואירועים";
  if (pathname.startsWith("/settings")) return "הגדרות חשבון";
  if (pathname.startsWith("/billing")) return "תשלום ומנוי";
  if (pathname.startsWith("/businesses/new")) return "עסק חדש";
  if (pathname.startsWith("/businesses/")) return "ניהול עסק";
  return "לוח בקרה";
}

export function DashboardShell({
  children,
  agencyName,
  agencyPlan,
}: {
  children: React.ReactNode;
  agencyName: string;
  agencyPlan: PlanTier;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <div className="flex min-h-screen bg-paper lg:flex-row">
      <Sidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        agencyName={agencyName}
        agencyPlan={agencyPlan}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNavOpen(true)} className="text-ink/70 hover:text-ink lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-base font-semibold text-ink sm:text-lg">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-flash text-center font-body text-sm font-semibold leading-9 text-flash-ink">
              א
            </div>
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}