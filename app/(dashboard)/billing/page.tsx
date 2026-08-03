// app/(dashboard)/billing/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { BillingPlans } from "@/components/billing-plans";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) notFound();

  const agency = await prisma.agency.findUnique({ where: { id: dbUser.agencyId } });
  if (!agency) notFound();

  const businessCount = await prisma.business.count({ where: { agencyId: agency.id } });

  return <BillingPlans currentPlan={agency.plan} businessCount={businessCount} />;
}