// components/photo-uploader.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function PhotoUploader({ businessId }: { businessId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File) {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError(`"${file.name}" אינו קובץ תמונה`);
      return;
    }

    const urlRes = await fetch("/api/photos/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, fileName: file.name }),
    });

    if (!urlRes.ok) {
      const body = await urlRes.json().catch(() => ({}));
      setError(body.error ?? "שגיאה ביצירת קישור העלאה");
      return;
    }

    const { path, token, publicUrl } = await urlRes.json();

    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from("business-photos")
      .uploadToSignedUrl(path, token, file);

    if (uploadError) {
      setError(`שגיאה בהעלאת "${file.name}"`);
      return;
    }

    const createRes = await fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        path,
        url: publicUrl,
        label: file.name.replace(/\.[^/.]+$/, ""),
      }),
    });

    if (!createRes.ok) {
      setError(`הועלה בהצלחה אך נכשל ברישום "${file.name}"`);
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    for (const file of Array.from(files)) {
      await uploadFile(file);
    }

    setIsUploading(false);
    router.refresh();
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed p-8 text-center transition-colors ${
        isDragging ? "border-flash bg-flash/5" : "border-border bg-surface hover:border-ink/30"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {isUploading ? (
        <Loader2 className="h-6 w-6 animate-spin text-ink/40" />
      ) : (
        <Upload className="h-6 w-6 text-ink/40" />
      )}

      <p className="font-body text-sm text-ink/60">
        {isUploading ? "מעלה..." : "גררי תמונות לכאן, או לחצי לבחירה"}
      </p>

      {error && <p className="font-util text-xs text-signal">{error}</p>}
    </div>
  );
}