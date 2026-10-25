"use server";

import "server-only";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  bookSlugFromTitle,
  readBookValues,
  validateBook,
} from "@/lib/book-input";
import type { BookFormState } from "@/lib/book-form-types";

// Cada ação confere a sessão e o papel ADMIN no servidor, sem depender da
// proteção da página. Cores de capa usam um par padrão derivado do título.

const COVER_PALETTE: [string, string][] = [
  ["#1F4E5F", "#2F7A8C"],
  ["#7A3B2E", "#A85A3F"],
  ["#2B2F6B", "#4650B5"],
  ["#14604A", "#2E9C74"],
  ["#5B2A66", "#8D4A9B"],
  ["#8A6A12", "#C79A22"],
  ["#1B3A57", "#2A6A9E"],
  ["#6B3A1A", "#B8692B"],
];

function coverColors(title: string) {
  let hash = 0;
  for (const char of title) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return COVER_PALETTE[hash % COVER_PALETTE.length];
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function saveBookAction(
  _previousState: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  await requireAdmin();

  const rawId = formData.get("id");
  const id = typeof rawId === "string" && rawId ? rawId : null;
  const values = readBookValues(formData);

  const db = getDb();
  let authors: { id: string }[];
  try {
    authors = await db.author.findMany({ select: { id: true } });
  } catch {
    return { error: "Não foi possível consultar os autores agora.", values };
  }

  const result = validateBook(values, new Set(authors.map((a) => a.id)));
  if ("errors" in result) {
    return { error: "Corrija os campos destacados.", fieldErrors: result.errors, values };
  }
  const { data } = result;

  let savedId: string;
  try {
    if (id) {
      // O endereço (slug) é criado uma vez e não muda ao editar o título,
      // para não quebrar links e carrinhos já existentes.
      const updated = await db.book.update({
        where: { id },
        data,
        select: { id: true },
      });
      savedId = updated.id;
    } else {
      const slug = bookSlugFromTitle(data.title);
      const [c1, c2] = coverColors(data.title);
      const created = await db.book.create({
        data: { ...data, slug, c1, c2, published: false },
        select: { id: true },
      });
      savedId = created.id;
    }
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        error: `Já existe um livro com o endereço “/livro/${bookSlugFromTitle(data.title)}”. Use um título diferente.`,
        fieldErrors: { title: "Título já usado por outro livro." },
        values,
      };
    }
    if (id && typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return { error: "Este livro não existe mais.", values };
    }
    return { error: "Não foi possível salvar o livro agora. Tente novamente.", values };
  }

  redirect(`/admin?editar=${savedId}&salvo=1#livros`);
}

export async function setBookPublishedAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");
  const publish = formData.get("publish") === "true";
  if (typeof id !== "string" || !id) redirect("/admin#livros");

  try {
    await getDb().book.update({ where: { id }, data: { published: publish }, select: { id: true } });
  } catch {
    redirect("/admin?erro=publicacao#livros");
  }
  redirect("/admin#livros");
}
