import "server-only";

import { cache } from "react";
import { getDb } from "@/lib/db";
import type { Author, Book } from "@/lib/data";

// Camada de leitura do catálogo (MySQL via Prisma). Tudo aqui roda só no
// servidor e devolve DTOs simples: o preço Decimal vira number antes de chegar
// aos componentes. O público só enxerga livros publicados.

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
  coverImageUrl: true,
  published: true,
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
  coverImageUrl: string | null;
  published: boolean;
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
    coverImageUrl: row.coverImageUrl,
  };
}

export type AdminBook = Book & {
  published: boolean;
  authorId: string;
  hasEbook: boolean;
  ebookMimeType: string | null;
  ebookOriginalName: string | null;
  ebookSize: number | null;
};

/** Livros publicados; `term` filtra por título ou nome do autor. */
export const listPublishedBooks = cache(async (term = ""): Promise<Book[]> => {
  const needle = term.trim().slice(0, 100);
  const rows = await getDb().book.findMany({
    where: {
      published: true,
      ...(needle
        ? {
            OR: [
              { title: { contains: needle } },
              { author: { name: { contains: needle } } },
            ],
          }
        : {}),
    },
    select: bookSelect,
    orderBy: [{ createdAt: "asc" }, { title: "asc" }],
  });
  return rows.map(toBook);
});

/**
 * Ranking de exemplo: ordena pelo número de avaliações. Na Entrega 4 passa a
 * vir das vendas reais.
 */
export const listBestSellers = cache(async (limit = 8): Promise<Book[]> => {
  const rows = await getDb().book.findMany({
    where: { published: true },
    select: bookSelect,
    orderBy: [{ reviewCount: "desc" }, { title: "asc" }],
    take: limit,
  });
  return rows.map(toBook);
});

export const getPublishedBook = cache(async (slug: string): Promise<Book | null> => {
  const row = await getDb().book.findFirst({
    where: { slug, published: true },
    select: bookSelect,
  });
  return row ? toBook(row) : null;
});

/** Recomendações: primeiro outros livros do mesmo autor, depois os demais. */
export const listRelatedBooks = cache(async (book: Book, limit = 6): Promise<Book[]> => {
  const rows = await getDb().book.findMany({
    where: { published: true, NOT: { id: book.id } },
    select: bookSelect,
    orderBy: [{ reviewCount: "desc" }, { title: "asc" }],
  });
  const all = rows.map(toBook);
  const sameAuthor = all.filter((b) => b.authorSlug === book.authorSlug);
  const others = all.filter((b) => b.authorSlug !== book.authorSlug);
  return [...sameAuthor, ...others].slice(0, limit);
});

/** Autores que têm ao menos um livro publicado (vitrine da página inicial). */
export const listAuthorsWithBooks = cache(async (): Promise<Author[]> => {
  const rows = await getDb().author.findMany({
    where: { books: { some: { published: true } } },
    select: {
      slug: true,
      name: true,
      color: true,
      bio: true,
      photoUrl: true,
      _count: { select: { books: { where: { published: true } } } },
    },
    orderBy: { name: "asc" },
  });
  return rows.map((a) => ({
    slug: a.slug,
    name: a.name,
    color: a.color,
    bio: a.bio,
    photoUrl: a.photoUrl,
    bookCount: a._count.books,
  }));
});

export const getAuthorWithBooks = cache(
  async (slug: string): Promise<{ author: Author; books: Book[] } | null> => {
    const row = await getDb().author.findUnique({
      where: { slug },
      select: {
        slug: true,
        name: true,
        color: true,
        bio: true,
        photoUrl: true,
        books: {
          where: { published: true },
          select: bookSelect,
          orderBy: [{ year: "desc" }, { title: "asc" }],
        },
      },
    });
    if (!row) return null;
    const books = row.books.map(toBook);
    return {
      author: {
        slug: row.slug,
        name: row.name,
        color: row.color,
        bio: row.bio,
        photoUrl: row.photoUrl,
        bookCount: books.length,
      },
      books,
    };
  },
);

// ---- Administração (use apenas depois de requireAdmin) ----

export async function listAllBooksForAdmin(): Promise<AdminBook[]> {
  const rows = await getDb().book.findMany({
    select: {
      ...bookSelect,
      authorId: true,
      ebookStorageKey: true,
      ebookMimeType: true,
      ebookOriginalName: true,
      ebookSize: true,
    },
    orderBy: [{ updatedAt: "desc" }],
  });
  return rows.map((row) => ({
    ...toBook(row),
    published: row.published,
    authorId: row.authorId,
    hasEbook: Boolean(row.ebookStorageKey),
    ebookMimeType: row.ebookMimeType,
    ebookOriginalName: row.ebookOriginalName,
    ebookSize: row.ebookSize,
  }));
}

export async function listAuthorOptions(): Promise<{ id: string; name: string }[]> {
  return getDb().author.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export type AdminAuthor = {
  id: string;
  slug: string;
  name: string;
  bio: string;
  color: string;
  photoUrl: string | null;
  publishedBookCount: number;
  totalBookCount: number;
};

export async function listAllAuthorsForAdmin(): Promise<AdminAuthor[]> {
  const rows = await getDb().author.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      bio: true,
      color: true,
      photoUrl: true,
      _count: { select: { books: true } },
      books: { where: { published: true }, select: { id: true } },
    },
    orderBy: { name: "asc" },
  });

  return rows.map((author) => ({
    id: author.id,
    slug: author.slug,
    name: author.name,
    bio: author.bio,
    color: author.color,
    photoUrl: author.photoUrl,
    publishedBookCount: author.books.length,
    totalBookCount: author._count.books,
  }));
}

export async function listAllCategories(): Promise<string[]> {
  const rows = await getDb().book.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
}
