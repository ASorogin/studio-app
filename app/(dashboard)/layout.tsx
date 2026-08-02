// app/(dashboard)/layout.tsx
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
          <h1 className="font-display text-lg font-semibold text-ink">לוח בקרה</h1>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-flash text-center font-body text-sm font-semibold leading-9 text-flash-ink">
              א
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}