// app/(dashboard)/page.tsx
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { BusinessCard } from "@/components/business-card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware כבר מגן על הנתיב הזה, אבל בדיקה נוספת כאן היא הרגל טוב
  // (defense in depth) — אם משום מה אין user, לא מנסים לשלוף עסקים בכלל.
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