// components/logo-uploader.tsx
"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoUploader({
  businessId,
  currentLogoUrl,
  onUploaded,
}: {
  businessId: string;
  currentLogoUrl: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("יש לבחור קובץ תמונה");
      return;
    }

    setIsUploading(true);

    const urlRes = await fetch("/api/photos/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, fileName: `logo-${file.name}` }),
    });

    if (!urlRes.ok) {
      setIsUploading(false);
      setError("שגיאה ביצירת קישור העלאה");
      return;
    }

    const { path, token, publicUrl } = await urlRes.json();

    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from("business-photos")
      .uploadToSignedUrl(path, token, file);

    setIsUploading(false);

    if (uploadError) {
      setError("שגיאה בהעלאת הקובץ");
      return;
    }

    onUploaded(publicUrl);
  }

  if (currentLogoUrl) {
    return (
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentLogoUrl}
          alt="לוגו"
          className="h-16 w-16 rounded-sm border border-border object-cover"
        />
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 font-util text-xs text-indigo hover:underline disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {isUploading ? "מעלה..." : "החלפת לוגו"}
          </button>
          <button
            type="button"
            onClick={() => onUploaded("")}
            className="flex items-center gap-1.5 font-util text-xs text-ink/50 hover:text-signal"
          >
            <X className="h-3.5 w-3.5" />
            הסרת לוגו
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {error && <p className="font-util text-xs text-signal">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-2 rounded-sm border border-dashed border-border bg-paper px-4 py-3 font-util text-xs text-ink/60 hover:border-ink/30 disabled:opacity-50"
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {isUploading ? "מעלה..." : "העלאת לוגו"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="mt-1 font-util text-xs text-signal">{error}</p>}
    </div>
  );
}