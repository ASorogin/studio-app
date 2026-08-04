// components/delete-business-dialog.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, X } from "lucide-react";

const CONFIRM_WORD = "הסרה";

export function DeleteBusinessDialog({
  businessId,
  businessName,
}: {
  businessId: string;
  businessName: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canConfirm = confirmText.trim() === CONFIRM_WORD;

  function closeDialog() {
    setIsOpen(false);
    setConfirmText("");
    setError(null);
  }

  async function handleDelete() {
    if (!canConfirm) return;
    setIsDeleting(true);
    setError(null);

    const res = await fetch(`/api/businesses/${businessId}`, { method: "DELETE" });

    setIsDeleting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "שגיאה בהסרת העסק");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <>
      <div className="rounded-card border border-signal/30 bg-signal/5 p-6">
        <h3 className="font-display text-base font-semibold text-signal">אזור מסוכן</h3>
        <p className="mt-1 font-body text-sm text-ink/60">
          הסרת העסק תמחק לצמיתות את כל התמונות, הפרסומות, ותכנון התוכן שלו. לא ניתן לשחזר.
        </p>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-4 rounded-sm border border-signal px-4 py-2 font-util text-sm font-semibold text-signal hover:bg-signal/10"
        >
          הסרת העסק
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-card border border-border bg-surface p-6 shadow-card-lg">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-signal" />
                <h3 className="font-display text-base font-semibold text-ink">הסרת {businessName}</h3>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                className="text-ink/40 hover:text-ink"
                aria-label="סגירה"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-4 font-body text-sm text-ink/60">
              פעולה זו סופית ולא ניתנת לביטול. כדי לאשר, יש להקליד את המילה{" "}
              <span className="font-semibold text-ink">&quot;{CONFIRM_WORD}&quot;</span> בשדה למטה.
            </p>

            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_WORD}
              autoFocus
              className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
            />

            {error && (
              <p className="mt-3 rounded-sm bg-signal/10 px-3 py-2 font-util text-xs text-signal">
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDialog}
                className="rounded-sm px-4 py-2 font-util text-sm text-ink/60 hover:text-ink"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!canConfirm || isDeleting}
                className="flex items-center gap-2 rounded-sm bg-signal px-4 py-2 font-util text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isDeleting ? "מסיר..." : "אישור הסרה"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}