import { PrismaClient } from "@prisma/client";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(fileURLToPath(import.meta.url));
const localDatabaseUrl = `file:${join(packageRoot, "../prisma/dev.db")}`;

process.env.DATABASE_URL ??= localDatabaseUrl;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function getDatabaseProvider(): "sqlite" | "postgresql" | "unknown" {
  const url = process.env.DATABASE_URL ?? "";

  if (url.startsWith("file:")) {
    return "sqlite";
  }

  if (url.startsWith("postgresql://")) {
    return "postgresql";
  }

  return "unknown";
}
