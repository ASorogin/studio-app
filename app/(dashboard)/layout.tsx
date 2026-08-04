// app/(dashboard)/layout.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { agency: true },
  });
  if (!dbUser) notFound();

  return (
    <DashboardShell agencyName={dbUser.agency.name} agencyPlan={dbUser.agency.plan}>
      {children}
    </DashboardShell>
  );
}