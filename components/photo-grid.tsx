// components/photo-grid.tsx
import { ImageIcon, CheckCircle2 } from "lucide-react";
import type { Photo } from "@/lib/mock-data";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border bg-surface py-16 text-center">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-8 w-8 rounded-sm border-2 border-border" />
          ))}
        </div>
        <p className="font-body text-sm text-ink/60">עדיין אין תמונות בתיקייה הזו</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {photos.map((photo) => (
        <PhotoTile key={photo.id} photo={photo} />
      ))}
    </div>
  );
}

function PhotoTile({ photo }: { photo: Photo }) {
  const isUsed = photo.status === "used";

  return (
    <div className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card">
      <div className="relative flex aspect-square items-center justify-center bg-paper-2">
        <ImageIcon className="h-8 w-8 text-ink/20" />

        <span
          className={`absolute top-2 right-2 flex items-center gap-1 rounded-sm px-2 py-0.5 font-util text-[10px] font-medium ${
            isUsed ? "bg-ink/80 text-paper" : "bg-success/15 text-success"
          }`}
        >
          {isUsed && <CheckCircle2 className="h-3 w-3" />}
          {isUsed ? "נוצל" : "זמין"}
        </span>
      </div>

      <div className="p-2.5">
        <p className="truncate font-body text-xs text-ink">{photo.label}</p>
      </div>
    </div>
  );
}