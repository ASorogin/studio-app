// components/ad-generator.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Sparkles,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  CalendarPlus,
  Check,
  X,
} from "lucide-react";
import type { Business, Photo, Event } from "@prisma/client";
import { AdCard } from "@/components/ad-card";
import { AdActions } from "@/components/ad-actions";
import {
  designStyleOptions,
  creativeAngleOptions,
  type DesignStyle,
  type CreativeAngle,
} from "@/lib/ad-options";

type Format = "feed" | "story" | "reel";
type TextMode = "auto" | "manual";
type StatusFilter = "all" | "available" | "used";
type SortOrder = "newest" | "oldest";
type PhotoSlot = "background" | "subject";

type CopySuggestion = {
  headline: string;
  subheadline: string;
  caption: string;
  hashtags: string[];
};

type GeneratedResult = {
  id: string;
  format: Format;
  headline: string;
  caption: string;
  outputImageUrl: string;
  scheduledDate: string | null;
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

export function AdGenerator({
  business,
  photos,
  event,
}: {
  business: Business;
  photos: Photo[];
  event: Event | null;
}) {
  const [format, setFormat] = useState<Format>("feed");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [activeSlot, setActiveSlot] = useState<PhotoSlot>("background");
  const [backgroundPhotoId, setBackgroundPhotoId] = useState<string | null>(null);
  const [subjectPhotoId, setSubjectPhotoId] = useState<string | null>(null);

  const [includeText, setIncludeText] = useState(true);
  const [textMode, setTextMode] = useState<TextMode>("auto");
  const [rawIdea, setRawIdea] = useState("");
  const [designStyle, setDesignStyle] = useState<DesignStyle>(
    (business.defaultDesignStyle as DesignStyle) || "auto"
  );
  const [creativeAngle, setCreativeAngle] = useState<CreativeAngle>("auto");
  const [creativeBrief, setCreativeBrief] = useState("");

  const [suggestions, setSuggestions] = useState<CopySuggestion[] | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number | null>(null);

  const [manualHeadline, setManualHeadline] = useState("");
  const [manualSubheadline, setManualSubheadline] = useState("");
  const [manualCaption, setManualCaption] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);

  const visiblePhotos = useMemo(() => {
    const filtered = photos.filter((p) => statusFilter === "all" || p.status === statusFilter);
    return [...filtered].sort((a, b) => {
      const diff = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      return sortOrder === "newest" ? -diff : diff;
    });
  }, [photos, statusFilter, sortOrder]);

  function handlePhotoClick(photoId: string) {
    if (activeSlot === "background") {
      setBackgroundPhotoId((prev) => (prev === photoId ? null : photoId));
    } else {
      setSubjectPhotoId((prev) => (prev === photoId ? null : photoId));
    }
  }

  async function handleGetSuggestions() {
    if (!rawIdea.trim()) return;
    setIsLoadingSuggestions(true);
    setError(null);
    setSuggestions(null);
    setSelectedSuggestionIndex(null);

    const res = await fetch("/api/ads/generate-copy-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId: business.id,
        format,
        rawIdea,
        creativeAngle,
        eventId: event?.id,
      }),
    });

    setIsLoadingSuggestions(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "שגיאה ביצירת הצעות");
      return;
    }

    const data = await res.json();
    setSuggestions(data.suggestions);
  }

  function pickSuggestion(index: number) {
    setSelectedSuggestionIndex(index);
    const s = suggestions?.[index];
    if (s) {
      setManualHeadline(s.headline);
      setManualSubheadline(s.subheadline);
      setManualCaption(
        s.hashtags?.length ? s.caption + "\n\n" + s.hashtags.map((h) => "#" + h).join(" ") : s.caption
      );
    }
  }

  async function handleGenerate() {
    if (!backgroundPhotoId) return;
    if (includeText && !manualHeadline.trim()) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const imagePromptRes = await fetch("/api/ads/generate-image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          backgroundPhotoId,
          subjectPhotoId,
          format,
          headline: includeText ? manualHeadline : "",
          subheadline: includeText ? manualSubheadline : "",
          includeText,
          designStyle,
          creativeAngle,
          creativeBrief,
        }),
      });

      if (!imagePromptRes.ok) {
        const body = await imagePromptRes.json().catch(() => ({}));
        setError(body.error ?? "שגיאה בהכנת הנחיית עיצוב");
        setIsGenerating(false);
        return;
      }
      const { imagePrompt, composition } = await imagePromptRes.json();

      const renderRes = await fetch("/api/ads/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          backgroundPhotoId,
          subjectPhotoId,
          headline: includeText ? manualHeadline : "",
          subheadline: includeText ? manualSubheadline : "",
          caption: includeText ? manualCaption : "",
          format,
          textMode,
          includeText,
          eventId: event?.id,
          imagePrompt,
          textArea: composition?.textArea,
        }),
      });

      if (!renderRes.ok) {
        const body = await renderRes.json().catch(() => ({}));
        setError(body.error ?? "שגיאה ביצירת הפרסומת");
        setIsGenerating(false);
        return;
      }

      const data = await renderRes.json();
      setResult({
        id: data.ad.id,
        format,
        headline: data.ad.headline,
        caption: data.ad.caption,
        outputImageUrl: data.ad.outputImageUrl,
        scheduledDate: null,
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSchedule(adId: string, date: string) {
    if (!date) return;
    setSchedulingId(adId);

    const res = await fetch("/api/calendar-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: business.id, adId, date }),
    });

    setSchedulingId(null);

    if (res.ok && result) {
      setResult({ ...result, scheduledDate: date });
    }
  }

  const canGenerate =
    !!backgroundPhotoId && (!includeText || manualHeadline.trim().length > 0) && !isGenerating;

  return (
    <div className="flex flex-col gap-6">
      {event && (
        <div className="flex items-center gap-2 rounded-sm bg-indigo/10 px-4 py-2.5">
          <span className="text-lg">{event.emoji}</span>
          <span className="font-util text-sm text-indigo">
            יוצרים פרסומת לאירוע: <strong>{event.name}</strong>
          </span>
        </div>
      )}

      {/* פורמט */}
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

      {/* בחירת תמונות */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setActiveSlot("background")}
              className={`rounded-sm px-3 py-1.5 font-util text-xs transition-colors ${
                activeSlot === "background"
                  ? "bg-ink font-semibold text-paper"
                  : "bg-paper-2 text-ink/60 hover:text-ink"
              }`}
            >
              בחירת תמונת רקע {backgroundPhotoId && "✓"}
            </button>
            <button
              type="button"
              onClick={() => setActiveSlot("subject")}
              className={`rounded-sm px-3 py-1.5 font-util text-xs transition-colors ${
                activeSlot === "subject"
                  ? "bg-ink font-semibold text-paper"
                  : "bg-paper-2 text-ink/60 hover:text-ink"
              }`}
            >
              בחירת נושא/גרפיקה נוספת (אופציונלי) {subjectPhotoId && "✓"}
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            <ToggleGroup
              label="סינון"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as StatusFilter)}
              options={statusFilterOptions}
            />
            <ToggleGroup
              label="מיון"
              value={sortOrder}
              onChange={(v) => setSortOrder(v as SortOrder)}
              options={sortOrderOptions}
            />
          </div>
        </div>

        {subjectPhotoId && (
          <button
            type="button"
            onClick={() => setSubjectPhotoId(null)}
            className="flex w-fit items-center gap-1 font-util text-xs text-ink/50 hover:text-signal"
          >
            <X className="h-3 w-3" />
            הסרת תמונת הנושא הנוספת
          </button>
        )}

        {visiblePhotos.length === 0 ? (
          <p className="rounded-card border border-dashed border-border bg-surface p-6 text-center font-body text-sm text-ink/50">
            אין תמונות שתואמות לסינון — יש להעלות תמונות בתיקייה קודם
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {visiblePhotos.map((photo) => {
              const isBackground = backgroundPhotoId === photo.id;
              const isSubject = subjectPhotoId === photo.id;
              const isUsed = photo.status === "used";
              const hasRealImage = !photo.thumbUrl.startsWith("/mock/");
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => handlePhotoClick(photo.id)}
                  className={`relative flex aspect-square flex-col items-center justify-center gap-1 overflow-hidden rounded-sm border-2 bg-paper-2 transition-colors ${
                    isBackground
                      ? "border-flash"
                      : isSubject
                        ? "border-indigo"
                        : "border-transparent hover:border-border"
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

                  {isBackground && (
                    <span className="absolute top-1.5 right-1.5 rounded-sm bg-flash px-1.5 py-0.5 font-util text-[9px] font-semibold text-flash-ink">
                      רקע
                    </span>
                  )}
                  {isSubject && (
                    <span className="absolute top-1.5 right-1.5 rounded-sm bg-indigo px-1.5 py-0.5 font-util text-[9px] font-semibold text-white">
                      נושא
                    </span>
                  )}
                  {!isBackground && !isSubject && isUsed && (
                    <span className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-sm bg-ink/80 px-1.5 py-0.5 font-util text-[9px] font-medium text-paper">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      נוצל
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* סגנון + זווית */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="font-util text-xs text-ink/60">סגנון עיצוב</span>
          <select
            value={designStyle}
            onChange={(e) => setDesignStyle(e.target.value as DesignStyle)}
            className="w-fit rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
          >
            {designStyleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="font-util text-xs text-ink/60">זווית יצירתית</span>
          <select
            value={creativeAngle}
            onChange={(e) => setCreativeAngle(e.target.value as CreativeAngle)}
            className="w-fit rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
          >
            {creativeAngleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* תיאור כללי / קונספט */}
      <div className="flex flex-col gap-1.5">
        <span className="font-util text-xs text-ink/60">
          תיאור כללי / קונספט לפרסומת (אופציונלי) — למה זה, איזה אירוע, מה רוצים שיצא מזה
        </span>
        <textarea
          value={creativeBrief}
          onChange={(e) => setCreativeBrief(e.target.value)}
          rows={2}
          placeholder='לדוגמה: "רוצה שהמוצר יראה כאילו הוא ממש חלק מהסצנה, אווירה חמה של ערב חורפי, קצת דרמטי"'
          className="rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
        />
      </div>

      {/* טקסט */}
      <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card">
        <label className="flex w-fit items-center gap-2">
          <input
            type="checkbox"
            checked={includeText}
            onChange={(e) => setIncludeText(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="font-util text-sm text-ink">פרסומת עם טקסט (בטלי לפרסומת ויזואלית בלבד)</span>
        </label>

        {includeText && (
          <>
            <ToggleGroup
              label="מקור הטקסט"
              value={textMode}
              onChange={(v) => setTextMode(v as TextMode)}
              options={[
                { value: "auto", label: "הצעות AI מרעיון שלי" },
                { value: "manual", label: "כתיבה ידנית מלאה" },
              ]}
            />

            {textMode === "auto" ? (
              <>
                <label className="flex flex-col gap-1.5">
                  <span className="font-util text-xs text-ink/60">הרעיון שלך לפרסומת (חובה)</span>
                  <textarea
                    value={rawIdea}
                    onChange={(e) => setRawIdea(e.target.value)}
                    rows={2}
                    placeholder='לדוגמה: "1+1 על קפה קר עד 18:00 היום" או "רוצה להדגיש את הקרואסונים החדשים"'
                    className="rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleGetSuggestions}
                  disabled={!rawIdea.trim() || isLoadingSuggestions}
                  className="flex w-fit items-center gap-2 rounded-sm bg-ink px-4 py-2 font-util text-sm font-semibold text-paper hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isLoadingSuggestions ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isLoadingSuggestions ? "חושב..." : "קבלת הצעות ניסוח"}
                </button>

                {suggestions && (
                  <div className="flex flex-col gap-2">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => pickSuggestion(i)}
                        className={`flex flex-col gap-1 rounded-sm border-2 p-3 text-right transition-colors ${
                          selectedSuggestionIndex === i
                            ? "border-flash bg-flash/5"
                            : "border-border bg-paper hover:border-ink/30"
                        }`}
                      >
                        <p className="font-display text-sm font-semibold text-ink">{s.headline}</p>
                        <p className="font-util text-xs text-ink/60">{s.subheadline}</p>
                        <p className="line-clamp-2 font-body text-xs text-ink/50">{s.caption}</p>
                      </button>
                    ))}
                  </div>
                )}

                {selectedSuggestionIndex !== null && (
                  <div className="flex flex-col gap-2 border-t border-border pt-3">
                    <span className="font-util text-xs text-ink/60">נבחר — ניתן לערוך:</span>
                    <input
                      value={manualHeadline}
                      onChange={(e) => setManualHeadline(e.target.value)}
                      className="rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
                      placeholder="כותרת"
                    />
                    <input
                      value={manualSubheadline}
                      onChange={(e) => setManualSubheadline(e.target.value)}
                      className="rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
                      placeholder="תת-כותרת"
                    />
                    <textarea
                      value={manualCaption}
                      onChange={(e) => setManualCaption(e.target.value)}
                      rows={3}
                      className="rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
                      placeholder="טקסט הפוסט המלא"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  value={manualHeadline}
                  onChange={(e) => setManualHeadline(e.target.value)}
                  className="rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
                  placeholder="כותרת (תופיע בתוך התמונה)"
                />
                <input
                  value={manualSubheadline}
                  onChange={(e) => setManualSubheadline(e.target.value)}
                  className="rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
                  placeholder="תת-כותרת (תופיע בתוך התמונה)"
                />
                <textarea
                  value={manualCaption}
                  onChange={(e) => setManualCaption(e.target.value)}
                  rows={3}
                  className="rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-indigo"
                  placeholder="טקסט הפוסט המלא"
                />
              </div>
            )}
          </>
        )}
      </div>

      {error && (
        <p className="rounded-sm bg-signal/10 px-3 py-2 font-util text-xs text-signal">{error}</p>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!canGenerate}
        className="flex w-fit items-center gap-2 rounded-sm bg-flash px-5 py-2 font-body text-sm font-semibold text-flash-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {isGenerating ? "מייצר..." : "יצירת פרסומת"}
      </button>

      {result && (
        <div className="flex flex-col gap-3 border-t border-border pt-6">
          <h3 className="font-display text-sm font-semibold text-ink">תוצאה</h3>
          <div className="max-w-xs">
            <div className="flex flex-col gap-2">
              <AdCard
                ad={{
                  id: result.id,
                  businessId: business.id,
                  photoId: "",
                  format: result.format,
                  headline: result.headline,
                  caption: result.caption,
                  textMode,
                  outputImageUrl: result.outputImageUrl,
                  eventId: event?.id ?? null,
                  createdAt: new Date(),
                }}
              />
              <AdActions imageUrl={result.outputImageUrl} headline={result.headline} caption={result.caption} />
              {result.scheduledDate ? (
                <span className="flex items-center gap-1.5 rounded-sm bg-success/10 px-2.5 py-1.5 font-util text-xs text-success">
                  <Check className="h-3.5 w-3.5" />
                  מתוזמן ל-{new Date(result.scheduledDate).toLocaleDateString("he-IL")}
                </span>
              ) : (
                <label className="flex items-center gap-1.5 rounded-sm border border-border bg-paper px-2.5 py-1.5">
                  <CalendarPlus className="h-3.5 w-3.5 shrink-0 text-ink/50" />
                  <input
                    type="date"
                    disabled={schedulingId === result.id}
                    onChange={(e) => handleSchedule(result.id, e.target.value)}
                    className="w-full bg-transparent font-util text-xs text-ink/70 outline-none"
                  />
                </label>
              )}
            </div>
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