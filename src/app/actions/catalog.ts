"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { removeStoredEbook, removeStoredImage } from "@/lib/media-storage";
import {
  bookSlugFromTitle,
  readBookValues,
  validateBook,
} from "@/lib/book-input";
import type { BookFormState, SavedBook } from "@/lib/book-form-types";

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

function isPrismaCode(error: unknown, code: string) {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}

function savedBook(record: {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string | null;
  ebookStorageKey: string | null;
  ebookMimeType: string | null;
  ebookOriginalName: string | null;
  ebookSize: number | null;
}): SavedBook {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    coverImageUrl: record.coverImageUrl,
    hasEbook: Boolean(record.ebookStorageKey),
    ebookMimeType: record.ebookMimeType,
    ebookOriginalName: record.ebookOriginalName,
    ebookSize: record.ebookSize,
  };
}

const savedBookSelect = {
  id: true,
  slug: true,
  title: true,
  coverImageUrl: true,
  ebookStorageKey: true,
  ebookMimeType: true,
  ebookOriginalName: true,
  ebookSize: true,
} as const;

function revalidateCatalog() {
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/livro/[slug]", "page");
  revalidatePath("/autor/[slug]", "page");
}

export async function saveBookAction(
  _previousState: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  const user = await requireStaff();
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

  const result = validateBook(values, new Set(authors.map((author) => author.id)));
  if ("errors" in result) {
    return { error: "Corrija os campos destacados.", fieldErrors: result.errors, values };
  }
  const { data } = result;

  if (id && user.role === "EMPLOYEE") {
    try {
      const existing = await db.book.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return { error: "Este livro não existe mais.", values };
      const pending = await db.catalogChange.findFirst({
        where: { entityType: "BOOK", entityId: id, status: "PENDING" },
        select: { id: true },
      });
      if (pending) {
        return { error: "Este livro já tem uma edição aguardando confirmação do administrador.", values };
      }
      await db.catalogChange.create({
        data: {
          entityType: "BOOK",
          entityId: id,
          payload: {
            title: data.title,
            authorId: data.authorId,
            year: data.year,
            category: data.category,
            pages: data.pages,
            price: data.price,
            synopsis: data.synopsis,
          },
          submittedById: user.id,
        },
      });
    } catch {
      return { error: "Não foi possível enviar a edição para aprovação.", values };
    }
    revalidatePath("/admin");
    redirect("/admin?notice=livro-enviado#livros");
  }

  if (id) {
    try {
      const current = await db.book.findUnique({ where: { id }, select: { id: true, published: true } });
      if (!current) return { error: "Este livro não existe mais.", values };
      if (current.published) {
        const targetAuthor = await db.author.findUnique({ where: { id: data.authorId }, select: { published: true } });
        if (!targetAuthor?.published) return { error: "Publique o autor antes de associá-lo a um livro publicado.", values };
      }
      await db.book.update({ where: { id }, data, select: { id: true } });
    } catch (error) {
      if (isPrismaCode(error, "P2025")) return { error: "Este livro não existe mais.", values };
      return { error: "Não foi possível salvar o livro agora. Tente novamente.", values };
    }
    revalidateCatalog();
    redirect("/admin?notice=livro-confirmado#livros");
  }

  let record;
  try {
    const slug = bookSlugFromTitle(data.title);
    const [c1, c2] = coverColors(data.title);
    record = await db.book.create({
      data: { ...data, slug, c1, c2, published: false },
      select: savedBookSelect,
    });
  } catch (error) {
    if (isPrismaCode(error, "P2002")) {
      return {
        error: `Já existe um livro com o endereço “/livro/${bookSlugFromTitle(data.title)}”. Use um título diferente.`,
        fieldErrors: { title: "Título já usado por outro livro." },
        values,
      };
    }
    return { error: "Não foi possível cadastrar o livro agora. Tente novamente.", values };
  }

  revalidateCatalog();
  return {
    success: "Livro cadastrado como rascunho. Envie os arquivos e solicite a publicação a um administrador.",
    values,
    savedBook: savedBook(record),
  };
}

export async function setBookPublishedAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  const publish = formData.get("publish") === "true";
  if (typeof id !== "string" || !id) redirect("/admin#livros");

  let book: { id: string; author: { published: boolean } } | null;
  try {
    book = await getDb().book.findUnique({
      where: { id },
      select: { id: true, author: { select: { published: true } } },
    });
  } catch {
    redirect("/admin?notice=erro-publicacao-livro#livros");
  }
  if (!book) redirect("/admin?notice=livro-inexistente#livros");
  if (publish && !book.author.published) redirect("/admin?notice=autor-precisa-ser-publicado#livros");
  try {
    await getDb().book.update({ where: { id }, data: { published: publish }, select: { id: true } });
  } catch {
    redirect("/admin?notice=erro-publicacao-livro#livros");
  }
  revalidateCatalog();
  redirect(`/admin?notice=${publish ? "livro-publicado" : "livro-retirado"}#livros`);
}

export async function deleteBookAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) redirect("/admin#livros");

  type Result =
    | { outcome: "deleted"; media: { coverImageUrl: string | null; ebookStorageKey: string | null } }
    | { outcome: "missing" | "owned" | "pending" | "error" };
  let result: Result;
  try {
    result = await getDb().$transaction(async (tx): Promise<Result> => {
      const book = await tx.book.findUnique({
        where: { id },
        select: {
          id: true,
          coverImageUrl: true,
          ebookStorageKey: true,
          libraryItems: { select: { id: true }, take: 1 },
        },
      });
      if (!book) return { outcome: "missing" };
      if (book.libraryItems.length > 0) return { outcome: "owned" };
      const pending = await tx.catalogChange.findFirst({
        where: { entityType: "BOOK", entityId: id, status: "PENDING" },
        select: { id: true },
      });
      if (pending) return { outcome: "pending" };
      await tx.book.delete({ where: { id } });
      return { outcome: "deleted", media: { coverImageUrl: book.coverImageUrl, ebookStorageKey: book.ebookStorageKey } };
    });
  } catch {
    result = { outcome: "error" };
  }

  if (result.outcome !== "deleted") {
    const notice = result.outcome === "owned" ? "livro-na-biblioteca" : result.outcome === "pending" ? "livro-com-pendencia" : result.outcome === "missing" ? "livro-inexistente" : "erro-excluir-livro";
    redirect(`/admin?notice=${notice}#livros`);
  }
  await Promise.all([
    removeStoredImage(result.media.coverImageUrl, "covers"),
    removeStoredEbook(result.media.ebookStorageKey),
  ]);
  revalidateCatalog();
  redirect("/admin?notice=livro-excluido#livros");
}
