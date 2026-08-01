import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prismaClient: PrismaClient | undefined };

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!globalForPrisma.prismaClient) {
      globalForPrisma.prismaClient = new PrismaClient({
        url: process.env.DATABASE_URL,
      } as any);
    }
    return (globalForPrisma.prismaClient as any)[prop];
  }
});
