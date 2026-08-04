// app/(dashboard)/businesses/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { BusinessProfileForm } from "@/components/business-profile-form";
import { BusinessSubNav } from "@/components/business-sub-nav";
import { DeleteBusinessDialog } from "@/components/delete-business-dialog";

export default async function BusinessProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) {
    notFound();
  }

  const business = await prisma.business.findFirst({
    where: { id, agencyId: dbUser.agencyId },
  });

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

      {dbUser.role === "owner" && (
        <DeleteBusinessDialog businessId={business.id} businessName={business.name} />
      )}
    </div>
  );
}