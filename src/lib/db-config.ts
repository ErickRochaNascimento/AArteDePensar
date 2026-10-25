// Lê DATABASE_URL e monta a configuração do MySQL/MariaDB.
// Sem "server-only" de propósito: também é usado pelo seed (prisma/seed.ts).

export function getMariaDbConfig() {
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

  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user,
    password,
    database,
    connectionLimit: 5,
  };
}
