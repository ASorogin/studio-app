// components/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, Settings, CreditCard, Film, X } from "lucide-react";
import { mockAgency } from "@/lib/mock-data";

const navItems = [
  { href: "/", label: "לוח בקרה", icon: LayoutDashboard },
  { href: "/history", label: "היסטוריית פרסומות", icon: History },
  { href: "/settings", label: "הגדרות חשבון", icon: Settings },
  { href: "/billing", label: "תשלום ומנוי", icon: CreditCard },
];

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-64 flex-col justify-between bg-ink px-4 py-6 text-paper transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div>
          <div className="mb-8 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Film className="h-6 w-6 text-flash" />
              <span className="font-display text-lg font-bold text-paper">Studio</span>
            </div>
            <button onClick={onClose} className="text-paper/60 hover:text-paper lg:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-sm px-3 py-2 font-body text-sm transition-colors ${
                    isActive
                      ? "bg-flash text-flash-ink font-semibold"
                      : "text-paper/80 hover:bg-white/10 hover:text-paper"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="rounded-sm border border-white/10 px-3 py-3">
          <p className="font-util text-xs text-paper/60">סוכנות</p>
          <p className="font-body text-sm font-medium text-paper">{mockAgency.name}</p>
          <span className="mt-1 inline-block rounded-sm bg-flash/20 px-2 py-0.5 font-util text-[10px] uppercase text-flash">
            {mockAgency.plan}
          </span>
        </div>
      </aside>
    </>
  );
}