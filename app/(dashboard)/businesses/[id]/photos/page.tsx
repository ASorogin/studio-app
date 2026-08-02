// app/(dashboard)/businesses/[id]/photos/page.tsx
import { notFound } from "next/navigation";
import { getBusinessById, getPhotosByBusiness, mockPhotoShoots } from "@/lib/mock-data";
import { PhotoGrid } from "@/components/photo-grid";
import { BusinessSubNav } from "@/components/business-sub-nav";

export default async function BusinessPhotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = getBusinessById(id);

  if (!business) {
    notFound();
  }

  const photos = getPhotosByBusiness(id);
  const shoots = mockPhotoShoots.filter((s) => s.businessId === id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">{business.name}</h2>
        <p className="font-util text-sm text-ink/60">
          {shoots.length} ימי צילומים · {photos.length} תמונות
        </p>
      </div>

      <BusinessSubNav businessId={business.id} />

      {shoots.length === 0 ? (
        <PhotoGrid photos={[]} />
      ) : (
        <div className="flex flex-col gap-8">
          {shoots.map((shoot) => (
            <div key={shoot.id} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-2">
                <h3 className="font-display text-sm font-semibold text-ink">{shoot.label}</h3>
                <span className="font-util text-xs text-ink/50">{shoot.shootDate}</span>
              </div>
              <PhotoGrid photos={photos.filter((p) => p.shootId === shoot.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}