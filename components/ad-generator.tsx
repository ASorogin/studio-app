// components/ad-generator.tsx
"use client";

import { useMemo, useState } from "react";
import { Sparkles, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import type { Business, Photo } from "@prisma/client";
import { AdCard } from "@/components/ad-card";

type Mode = "single" | "batch";
type TextMode = "auto" | "manual";
type Format = "feed" | "story" | "reel";
type StatusFilter = "all" | "available" | "used";
type SortOrder = "newest" | "oldest";

type GeneratedResult = {
  id: string;
  format: Format;
  headline: string;
  caption: string;
  outputImageUrl: string;
};

const formatOptions: { value: Format; label: string }[] = [
  { value: "feed", label: "פיד" },
  { value: "story", label: "סטורי" },
  { value: "reel", label: "ריל" },
];

const statusFilterOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "הכל" },
  { value: "available", label: "זמינות" },
  { value: "used", label: "נוצלו" },
];

const sortOrderOptions: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "מהחדש לישן" },
  { value: "oldest", label: "מהישן לחדש" },
];

export function AdGenerator({ business, photos }: { business: Business; photos: Photo[] }) {
  const [mode, setMode] = useState<Mode>("single");
  const [textMode, setTextMode] = useState<TextMode>("auto");
  const [format, setFormat] = useState<Format>("feed");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
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

  const visiblePhotos = useMemo(() => {
    const filtered = photos.filter((p) => statusFilter === "all" || p.status === statusFilter);
    return [...filtered].sort((a, b) => {
      const diff = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      return sortOrder === "newest" ? -diff : diff;
    });
  }, [photos, statusFilter, sortOrder]);

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
        const textRes = await fetch("/api/ads/generate-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId: business.id, format }),
        });
        if (textRes.ok) {
          const data = await textRes.json();
          headlineText = data.headline;
          captionText = data.caption;
        } else {
          headlineText = business.keywords[0] ?? business.industry;
          captionText = "בואו לבקר אותנו השבוע.";
        }
      }

      headlineText = headlineText || "כותרת ללא שם";
      captionText = captionText || "אין טקסט";

      let outputImageUrl = "";
      const renderRes = await fetch("/api/ads/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          photoId,
          headline: headlineText,
          caption: captionText,
          format,
          textMode,
        }),
      });
      if (renderRes.ok) {
        const data = await renderRes.json();
        outputImageUrl = data.ad.outputImageUrl;
      }

      generated.push({
        id: `${photoId}_${i}`,
        format,
        headline: headlineText,
        caption: captionText,
        outputImageUrl,
      });
    }

    setResults(generated);
    setIsGenerating(false);
  }

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

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <span className="font-util text-xs text-ink/60">
            {mode === "single" ? "בחירת תמונה" : "בחירת תמונות (אפשר כמה)"}
          </span>
          <div className="flex flex-wrap gap-4">
            <ToggleGroup
              label="סינון"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as StatusFilter)}
              options={statusFilterOptions}
            />
            <ToggleGroup
              label="מיון לפי העלאה"
              value={sortOrder}
              onChange={(v) => setSortOrder(v as SortOrder)}
              options={sortOrderOptions}
            />
          </div>
        </div>

        {visiblePhotos.length === 0 ? (
          <p className="rounded-card border border-dashed border-border bg-surface p-6 text-center font-body text-sm text-ink/50">
            אין תמונות שתואמות לסינון — יש להעלות תמונות בתיקייה קודם
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {visiblePhotos.map((photo) => {
              const isSelected = selectedIds.includes(photo.id);
              const isUsed = photo.status === "used";
              const hasRealImage = !photo.thumbUrl.startsWith("/mock/");
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => toggleSelect(photo.id)}
                  className={`relative flex aspect-square flex-col items-center justify-center gap-1 overflow-hidden rounded-sm border-2 bg-paper-2 transition-colors ${
                    isSelected ? "border-flash" : "border-transparent hover:border-border"
                  }`}
                >
                  {hasRealImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.thumbUrl}
                        alt={photo.label}
                        className={`absolute inset-0 h-full w-full object-cover ${isUsed ? "opacity-60" : ""}`}
                      />
                      <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1.5 py-1 text-center font-util text-[10px] text-white">
                        {photo.label}
                      </span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-6 w-6 text-ink/30" />
                      <span className="line-clamp-1 px-1 text-center font-util text-[10px] text-ink/60">
                        {photo.label}
                      </span>
                    </>
                  )}

                  <span
                    className={`absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-sm px-1.5 py-0.5 font-util text-[9px] font-medium ${
                      isUsed ? "bg-ink/80 text-paper" : "bg-success/80 text-white"
                    }`}
                  >
                    {isUsed && <CheckCircle2 className="h-2.5 w-2.5" />}
                    {isUsed ? "נוצל" : "זמין"}
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
          <h3 className="font-display text-sm font-semibold text-ink">תוצאה</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((r) => (
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
                  outputImageUrl: r.outputImageUrl,
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