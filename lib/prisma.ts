// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL, // pooled connection (6543) — לשימוש בזמן ריצה
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}