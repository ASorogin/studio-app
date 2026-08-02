// app/(dashboard)/businesses/[id]/generate/page.tsx
import { notFound } from "next/navigation";
import { getBusinessById, getPhotosByBusiness } from "@/lib/mock-data";
import { BusinessSubNav } from "@/components/business-sub-nav";
import { AdGenerator } from "@/components/ad-generator";

export default async function BusinessGeneratePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = getBusinessById(id);
  if (!business) notFound();

  const photos = getPhotosByBusiness(id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">{business.name}</h2>
        <p className="font-util text-sm text-ink/60">יצירת פרסומת חדשה</p>
      </div>
      <BusinessSubNav businessId={business.id} />
      <AdGenerator business={business} photos={photos} />
    </div>
  );
}