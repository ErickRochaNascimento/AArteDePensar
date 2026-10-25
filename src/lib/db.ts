import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";
import { getMariaDbConfig } from "@/lib/db-config";

const globalForPrisma = globalThis as typeof globalThis & {
  __livrariaPrisma?: PrismaClient;
};

export function getDb() {
  globalForPrisma.__livrariaPrisma ??= new PrismaClient({
    adapter: new PrismaMariaDb(getMariaDbConfig()),
  });

  return globalForPrisma.__livrariaPrisma;
}
