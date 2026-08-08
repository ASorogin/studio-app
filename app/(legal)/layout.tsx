// app/(legal)/layout.tsx
import Link from "next/link";
import { Film } from "lucide-react";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-border bg-surface px-6 py-4">
        <Link href="/" className="flex w-fit items-center gap-2">
          <Film className="h-5 w-5 text-flash" />
          <span className="font-display text-base font-bold text-ink">Studio</span>
        </Link>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="prose prose-sm max-w-none font-body text-ink [&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:font-display [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:leading-relaxed [&_li]:leading-relaxed [&_table]:w-full [&_table]:text-sm [&_th]:text-right [&_td]:text-right">
          {children}
        </div>
      </main>
    </div>
  );
}