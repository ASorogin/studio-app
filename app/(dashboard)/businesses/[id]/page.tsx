// app/(dashboard)/businesses/[id]/page.tsx
import { notFound } from "next/navigation";
import { getBusinessById } from "@/lib/mock-data";
import { BusinessProfileForm } from "@/components/business-profile-form";
import { BusinessSubNav } from "@/components/business-sub-nav";

export default async function BusinessProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = getBusinessById(id);

  if (!business) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full font-display text-xl font-bold"
          style={{ backgroundColor: business.colorSecondary, color: business.colorPrimary }}
        >
          {business.name.charAt(0)}
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">{business.name}</h2>
          <p className="font-util text-sm text-ink/60">{business.industry}</p>
        </div>
      </div>

      <BusinessSubNav businessId={business.id} />

      <BusinessProfileForm business={business} />
    </div>
  );
}