// app/(dashboard)/page.tsx
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { BusinessCard } from "@/components/business-card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { agency: true },
  });

  if (!dbUser) {
    return (
      <p className="font-body text-sm text-ink/60">
        לא נמצאה סוכנות משויכת למשתמש הזה.
      </p>
    );
  }

  const businesses = await prisma.business.findMany({
    where: { agencyId: dbUser.agencyId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">העסקים שלך</h2>
          <p className="font-body text-sm text-ink/60">{businesses.length} עסקים פעילים</p>
        </div>
        <Link
          href="/businesses/new"
          className="flex items-center gap-1.5 rounded-sm bg-flash px-3 py-1.5 font-util text-xs font-semibold text-flash-ink hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          עסק חדש
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {businesses.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>
    </div>
  );
}