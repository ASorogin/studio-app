// app/(dashboard)/page.tsx
import { BusinessCard } from "@/components/business-card";
import { getBusinessesByAgency, mockAgency } from "@/lib/mock-data";

export default function DashboardPage() {
  const businesses = getBusinessesByAgency(mockAgency.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">העסקים שלך</h2>
        <p className="font-body text-sm text-ink/60">{businesses.length} עסקים פעילים</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {businesses.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>
    </div>
  );
}