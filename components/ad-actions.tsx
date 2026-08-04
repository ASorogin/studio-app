// components/ad-actions.tsx
"use client";

import { useState } from "react";
import { Download, Copy, Check } from "lucide-react";

export function AdActions({
  imageUrl,
  headline,
  caption,
}: {
  imageUrl: string;
  headline: string;
  caption: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleDownload() {
    if (!imageUrl) return;
    setIsDownloading(true);
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${headline.replace(/[^a-zA-Z0-9א-ת]/g, "_") || "פרסומת"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // כשל בהורדה — לא חוסם, פשוט לא קורה כלום
    }
    setIsDownloading(false);
  }

  async function handleCopyCaption() {
    const text = `${headline}\n\n${caption}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // כשל בהעתקה (למשל דפדפן ללא הרשאה) — לא חוסם
    }
  }

  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        onClick={handleDownload}
        disabled={!imageUrl || isDownloading}
        className="flex items-center gap-1 rounded-sm bg-paper-2 px-2 py-1 font-util text-[11px] text-ink/70 hover:text-ink disabled:opacity-40"
      >
        <Download className="h-3 w-3" />
        הורדה
      </button>
      <button
        type="button"
        onClick={handleCopyCaption}
        className="flex items-center gap-1 rounded-sm bg-paper-2 px-2 py-1 font-util text-[11px] text-ink/70 hover:text-ink"
      >
        {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
        {copied ? "הועתק" : "העתקת טקסט"}
      </button>
    </div>
  );
}