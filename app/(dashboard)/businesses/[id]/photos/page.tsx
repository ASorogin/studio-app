// app/(dashboard)/businesses/[id]/photos/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { PhotoGrid } from "@/components/photo-grid";
import { BusinessSubNav } from "@/components/business-sub-nav";
import { PhotoUploader } from "@/components/photo-uploader";

export default async function BusinessPhotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
    orderBy: { shootDate: "asc" },
  });

  const totalPhotos = shoots.reduce((sum, s) => sum + s.photos.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">{business.name}</h2>
        <p className="font-util text-sm text-ink/60">
          {shoots.length} ימי צילומים · {totalPhotos} תמונות
        </p>
      </div>

      <BusinessSubNav businessId={business.id} />

      <PhotoUploader businessId={business.id} />

      {shoots.length === 0 ? (
        <PhotoGrid photos={[]} />
      ) : (
        <div className="flex flex-col gap-8">
          {shoots.map((shoot) => (
            <div key={shoot.id} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-2">
                <h3 className="font-display text-sm font-semibold text-ink">{shoot.label}</h3>
                <span className="font-util text-xs text-ink/50">
                  {shoot.shootDate.toISOString().slice(0, 10)}
                </span>
              </div>
              <PhotoGrid photos={shoot.photos} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}