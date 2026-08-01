import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? 
  (process.env.DATABASE_URL 
    ? new PrismaClient() 
    : (new Proxy({}, { get: () => () => Promise.resolve() }) as unknown as PrismaClient));

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
