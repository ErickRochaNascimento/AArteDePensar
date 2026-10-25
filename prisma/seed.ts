// Seed explícito e idempotente: `npm run db:seed`.
// Cria autores e livros de exemplo que ainda não existem (pelo slug) e NÃO
// sobrescreve registros já existentes, para não desfazer edições do Admin.
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { getMariaDbConfig } from "../src/lib/db-config";
import { SEED_AUTHORS, SEED_BOOKS } from "./seed-data";

async function main() {
  const config = getMariaDbConfig();
  console.log(`Seed no banco "${config.database}" em ${config.host}:${config.port}`);

  const db = new PrismaClient({ adapter: new PrismaMariaDb(config) });
  try {
    const authorIds = new Map<string, string>();
    let newAuthors = 0;
    let newBooks = 0;

    for (const author of SEED_AUTHORS) {
      const existing = await db.author.findUnique({
        where: { slug: author.slug },
        select: { id: true },
      });
      if (existing) {
        authorIds.set(author.slug, existing.id);
        continue;
      }
      const created = await db.author.create({ data: author, select: { id: true } });
      authorIds.set(author.slug, created.id);
      newAuthors++;
    }

    for (const { authorSlug, ...book } of SEED_BOOKS) {
      const authorId = authorIds.get(authorSlug);
      if (!authorId) throw new Error(`Autor não encontrado para o livro ${book.slug}`);

      const existing = await db.book.findUnique({
        where: { slug: book.slug },
        select: { id: true },
      });
      if (existing) continue;

      await db.book.create({ data: { ...book, authorId, published: true } });
      newBooks++;
    }

    console.log(`Concluído: ${newAuthors} autor(es) e ${newBooks} livro(s) novos.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
