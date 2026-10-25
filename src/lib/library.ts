import "server-only";

import { cache } from "react";
import { getDb } from "@/lib/db";
import type { Book } from "@/lib/data";

const bookSelect = {
  id: true,
  slug: true,
  title: true,
  year: true,
  price: true,
  category: true,
  pages: true,
  rating: true,
  reviewCount: true,
  synopsis: true,
  c1: true,
  c2: true,
  author: { select: { name: true, slug: true } },
} as const;

type BookRow = {
  id: string;
  slug: string;
  title: string;
  year: number;
  price: { toString(): string };
  category: string;
  pages: number;
  rating: { toString(): string };
  reviewCount: number;
  synopsis: string;
  c1: string;
  c2: string;
  author: { name: string; slug: string };
};

function toBook(row: BookRow): Book {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    author: row.author.name,
    authorSlug: row.author.slug,
    year: row.year,
    price: Number(row.price.toString()),
    category: row.category,
    pages: row.pages,
    rating: Number(row.rating.toString()),
    reviewCount: row.reviewCount,
    synopsis: row.synopsis,
    c1: row.c1,
    c2: row.c2,
  };
}

export type LibraryBook = {
  libraryItemId: string;
  progressPercent: number;
  acquiredAt: Date;
  lastReadAt: Date | null;
  book: Book;
};

/** Lista somente acessos já persistidos para este usuário. */
export const listUserLibrary = cache(async (userId: string): Promise<LibraryBook[]> => {
  const rows = await getDb().libraryItem.findMany({
    where: { userId },
    select: {
      id: true,
      progressPercent: true,
      acquiredAt: true,
      lastReadAt: true,
      book: { select: bookSelect },
    },
    orderBy: [{ updatedAt: "desc" }, { acquiredAt: "desc" }],
  });

  return rows.map((row) => ({
    libraryItemId: row.id,
    progressPercent: row.progressPercent,
    acquiredAt: row.acquiredAt,
    lastReadAt: row.lastReadAt,
    book: toBook(row.book),
  }));
});

/** Busca o livro na biblioteca do usuário sem confiar em IDs enviados pelo cliente. */
export const getUserLibraryBook = cache(
  async (userId: string, slug: string): Promise<LibraryBook | null> => {
    const row = await getDb().libraryItem.findFirst({
      where: { userId, book: { slug } },
      select: {
        id: true,
        progressPercent: true,
        acquiredAt: true,
        lastReadAt: true,
        book: { select: bookSelect },
      },
    });

    if (!row) return null;
    return {
      libraryItemId: row.id,
      progressPercent: row.progressPercent,
      acquiredAt: row.acquiredAt,
      lastReadAt: row.lastReadAt,
      book: toBook(row.book),
    };
  },
);
