// Tipos e utilitários compartilhados (servidor e navegador).
// Livros e autores vêm do MySQL (src/lib/catalog.ts); os metadados de exemplo
// ficam em prisma/seed-data.ts e só entram no banco com `npm run db:seed`.

import type { BookAgeRating } from "@/lib/book-rating";

export type Book = {
  id: string;
  slug: string;
  title: string;
  author: string;
  authorSlug: string;
  year: number;
  price: number;
  category: string;
  pages: number;
  ageRating: BookAgeRating | null;
  rating: number;
  reviewCount: number;
  synopsis: string;
  c1: string;
  c2: string;
  coverImageUrl?: string | null;
};

export type Author = {
  name: string;
  slug: string;
  color: string;
  bio: string;
  bookCount?: number;
  photoUrl?: string | null;
};

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Minúsculas e sem acentos, para comparar textos em buscas. */
export const normalizeText = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
export const formatBRL = (value: number) => brl.format(value);

// Avaliações demonstrativas (item Extra, Entrega 3). Só aparecem em livros com
// reviewCount > 0 no banco.
export const REVIEWS = [
  {
    name: "Camila R.",
    stars: 5,
    text: "Li em dois dias no leitor do site e depois baixei o EPUB para o celular.",
  },
  {
    name: "Rafael M.",
    stars: 4,
    text: "Prosa cuidadosa. O final poderia ser mais ousado, mas vale a leitura.",
  },
];

export const RATING_DISTRIBUTION: [number, number][] = [
  [5, 68],
  [4, 22],
  [3, 6],
  [2, 3],
  [1, 1],
];
