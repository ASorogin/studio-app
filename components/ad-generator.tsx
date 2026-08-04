// components/ad-generator.tsx
"use client";

import { useState } from "react";
import { Sparkles, Image as ImageIcon, Loader2 } from "lucide-react";
import type { Business, Photo } from "@prisma/client";
import { AdCard } from "@/components/ad-card";

type Mode = "single" | "batch";
type TextMode = "auto" | "manual";
type Format = "feed" | "story" | "reel";

type GeneratedResult = {
  id: string;
  format: Format;
  headline: string;
  caption: string;
};

const formatOptions: { value: Format; label: string }[] = [
  { value: "feed", label: "פיד" },
  { value: "story", label: "סטורי" },
  { value: "reel", label: "ריל" },
];

export function AdGenerator({ business, photos }: { business: Business; photos: Photo[] }) {
  const [mode, setMode] = useState<Mode>("single");
  const [textMode, setTextMode] = useState<TextMode>("auto");
  const [format, setFormat] = useState<Format>("feed");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [headline, setHeadline] = useState("");
  const [caption, setCaption] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedResult[]>([]);

  function toggleSelect(id: string) {
    if (mode === "single") {
      setSelectedIds([id]);
    } else {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }
  }

  async function handleGenerate() {
    if (selectedIds.length === 0) return;
    setIsGenerating(true);
    setResults([]);

    const generated: GeneratedResult[] = [];

    for (let i = 0; i < selectedIds.length; i++) {
      const photoId = selectedIds[i];

      let headlineText = headline;
      let captionText = caption;

      if (textMode === "auto") {
        const res = await fetch("/api/ads/generate-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId: business.id, format }),
        });

        if (res.ok) {
          const data = await res.json();
          headlineText = data.headline;
          captionText = data.caption;
        } else {
          headlineText = business.keywords[0] ?? business.industry;
          captionText = "בואו לבקר אותנו השבוע.";
        }
      }

      generated.push({
        id: `mock_${photoId}_${i}`,
        format,
        headline: headlineText || "כותרת ללא שם",
        caption: captionText || "אין טקסט",
      });
    }

    setResults(generated);
    setIsGenerating(false);
  }

  const availablePhotos = photos.filter((p) => p.status === "available" || selectedIds.includes(p.id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        <ToggleGroup
          label="מצב"
          value={mode}
          onChange={(v) => {
            setMode(v as Mode);
            setSelectedIds([]);
          }}
          options={[
            { value: "single", label: "תמונה בודדת" },
            { value: "batch", label: "Batch (כמה תמונות)" },
          ]}
        />
        <ToggleGroup
          label="טקסט"
          value={textMode}
          onChange={(v) => setTextMode(v as TextMode)}
          options={[
            { value: "auto", label: "אוטומטי (AI)" },
            { value: "manual", label: "ידני" },
          ]}
        />
        <div className="flex flex-col gap-1.5">
          <span className="font-util text-xs text-ink/60">פורמט</span>
          <div className="flex gap-1.5">
            {formatOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormat(opt.value)}
                className={`rounded-sm px-3 py-1.5 font-util text-xs transition-colors ${
                  format === opt.value
                    ? "bg-flash font-semibold text-flash-ink"
                    : "bg-paper-2 text-ink/60 hover:text-ink"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {textMode === "manual" && (
        <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card">
          <label className="flex flex-col gap-1.5">
            <span className="font-util text-xs text-ink/60">כותרת</span>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-util text-xs text-ink/60">טקסט פרסומת</span>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
            />
          </label>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="font-util text-xs text-ink/60">
          {mode === "single" ? "בחירת תמונה" : "בחירת תמונות (אפשר כמה)"}
        </span>
        {availablePhotos.length === 0 ? (
          <p className="rounded-card border border-dashed border-border bg-surface p-6 text-center font-body text-sm text-ink/50">
            אין תמונות זמינות לעסק הזה — יש להעלות תמונות בתיקייה קודם
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {availablePhotos.map((photo) => {
              const isSelected = selectedIds.includes(photo.id);
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => toggleSelect(photo.id)}
                  className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-sm border-2 bg-paper-2 transition-colors ${
                    isSelected ? "border-flash" : "border-transparent hover:border-border"
                  }`}
                >
                  <ImageIcon className="h-6 w-6 text-ink/30" />
                  <span className="line-clamp-1 px-1 text-center font-util text-[10px] text-ink/60">
                    {photo.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={selectedIds.length === 0 || isGenerating}
        className="flex w-fit items-center gap-2 rounded-sm bg-flash px-5 py-2 font-body text-sm font-semibold text-flash-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {isGenerating ? "מייצר..." : `יצירת פרסומת (${selectedIds.length})`}
      </button>

      {results.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-border pt-6">
          <h3 className="font-display text-sm font-semibold text-ink">תוצאה (מדומה)</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((r: GeneratedResult) => (
              <AdCard
                key={r.id}
                ad={{
                  id: r.id,
                  businessId: business.id,
                  photoId: "",
                  format: r.format,
                  headline: r.headline,
                  caption: r.caption,
                  textMode,
                  outputImageUrl: "",
                  eventId: null,
                  createdAt: new Date(),
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-util text-xs text-ink/60">{label}</span>
      <div className="flex gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-sm px-3 py-1.5 font-util text-xs transition-colors ${
              value === opt.value ? "bg-ink font-semibold text-paper" : "bg-paper-2 text-ink/60 hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}