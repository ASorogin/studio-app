// app/(dashboard)/businesses/[id]/generate/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { BusinessSubNav } from "@/components/business-sub-nav";
import { AdGenerator } from "@/components/ad-generator";

export default async function BusinessGeneratePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ eventId?: string }>;
}) {
  const { id } = await params;
  const { eventId } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) notFound();

  const business = await prisma.business.findFirst({
    where: { id, agencyId: dbUser.agencyId },
  });
  if (!business) notFound();

  const shoots = await prisma.photoShoot.findMany({
    where: { businessId: id },
    include: { photos: true },
  });
  const photos = shoots.flatMap((s) => s.photos);

  const event = eventId ? await prisma.event.findUnique({ where: { id: eventId } }) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">{business.name}</h2>
        <p className="font-util text-sm text-ink/60">יצירת פרסומת חדשה</p>
      </div>
      <BusinessSubNav businessId={business.id} />
      <AdGenerator business={business} photos={photos} event={event} />
    </div>
  );
}