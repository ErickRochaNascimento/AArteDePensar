import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  __livrariaPrisma?: PrismaClient;
};

function createAdapter() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não configurada. Copie .env.example para .env e preencha os dados do MySQL local.",
    );
  }

  const url = new URL(connectionString);
  if (url.protocol !== "mysql:") {
    throw new Error("DATABASE_URL deve usar o protocolo mysql://.");
  }

  const database = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);

  if (!url.hostname || !database || !user || !password) {
    throw new Error(
      "DATABASE_URL precisa conter host, banco, usuário e senha do MySQL.",
    );
  }

  return new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user,
    password,
    database,
    connectionLimit: 5,
  });
}

export function getDb() {
  globalForPrisma.__livrariaPrisma ??= new PrismaClient({
    adapter: createAdapter(),
  });

  return globalForPrisma.__livrariaPrisma;
}
