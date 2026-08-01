import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prismaClient: PrismaClient | undefined };

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!globalForPrisma.prismaClient) {
      globalForPrisma.prismaClient = new PrismaClient();
    }
    return (globalForPrisma.prismaClient as any)[prop];
  }
});
