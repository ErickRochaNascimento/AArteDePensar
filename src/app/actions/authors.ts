"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { removeStoredImage } from "@/lib/media-storage";
import { slugify } from "@/lib/data";
import type { AuthorFormState, AuthorFormValues } from "@/lib/author-form-types";

const EMPTY_VALUES: AuthorFormValues = { name: "", bio: "", color: "#1F4E5F" };
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isPrismaCode(error: unknown, code: string) {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}

function revalidateAuthors() {
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/autor/[slug]", "page");
  revalidatePath("/livro/[slug]", "page");
}

export async function saveAuthorAction(
  _previousState: AuthorFormState,
  formData: FormData,
): Promise<AuthorFormState> {
  const user = await requireStaff();
  const id = readText(formData, "id") || null;
  const values: AuthorFormValues = {
    name: readText(formData, "name"),
    bio: readText(formData, "bio"),
    color: readText(formData, "color") || EMPTY_VALUES.color,
  };
  const fieldErrors: NonNullable<AuthorFormState["fieldErrors"]> = {};

  if (values.name.length < 2 || values.name.length > 120) fieldErrors.name = "Informe um nome entre 2 e 120 caracteres.";
  if (values.bio.length < 10 || values.bio.length > 4000) fieldErrors.bio = "Escreva uma biografia entre 10 e 4000 caracteres.";
  if (!HEX_COLOR.test(values.color)) fieldErrors.color = "Escolha uma cor válida para o perfil.";
  const slug = slugify(values.name).slice(0, 120);
  if (!slug) fieldErrors.name = "O nome precisa conter letras ou números.";
  if (Object.keys(fieldErrors).length) return { values, fieldErrors, error: "Corrija os campos destacados." };

  const db = getDb();
  if (id && user.role === "EMPLOYEE") {
    try {
      const existing = await db.author.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return { values, error: "Este autor não existe mais. Atualize a página." };
      const pending = await db.catalogChange.findFirst({
        where: { entityType: "AUTHOR", entityId: id, status: "PENDING" },
        select: { id: true },
      });
      if (pending) return { values, error: "Este autor já tem uma edição aguardando confirmação do administrador." };
      await db.catalogChange.create({
        data: {
          entityType: "AUTHOR",
          entityId: id,
          payload: { name: values.name, bio: values.bio, color: values.color },
          submittedById: user.id,
        },
      });
    } catch {
      return { values, error: "Não foi possível enviar a edição para aprovação." };
    }
    revalidatePath("/admin");
    redirect("/admin?notice=autor-enviado#autores");
  }

  if (id) {
    try {
      await db.author.update({
        where: { id },
        data: { name: values.name, bio: values.bio, color: values.color },
        select: { id: true },
      });
    } catch (error) {
      if (isPrismaCode(error, "P2002")) {
        return { values, fieldErrors: { name: "Já existe um autor com esse nome ou endereço." }, error: "Não foi possível salvar o autor informado." };
      }
      if (isPrismaCode(error, "P2025")) return { values, error: "Este autor não existe mais. Atualize a página." };
      return { values, error: "Não foi possível salvar o autor agora. Tente novamente." };
    }
    revalidateAuthors();
    redirect("/admin?notice=autor-confirmado#autores");
  }

  try {
    const author = await db.author.create({
      data: { name: values.name, slug, bio: values.bio, color: values.color, published: false },
      select: { id: true, name: true, slug: true, bio: true, color: true, photoUrl: true, published: true },
    });
    revalidateAuthors();
    return {
      values,
      savedAuthor: author,
      success: "Autor cadastrado como rascunho. A publicação depende de um administrador.",
    };
  } catch (error) {
    if (isPrismaCode(error, "P2002")) {
      return {
        values,
        fieldErrors: { name: "Já existe um autor com esse nome ou endereço." },
        error: "Não foi possível salvar o autor informado.",
      };
    }
    return { values, error: "Não foi possível salvar o autor agora. Tente novamente." };
  }
}

export async function setAuthorPublishedAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  const publish = formData.get("publish") === "true";
  if (typeof id !== "string" || !id) redirect("/admin#autores");

  let author: { id: string } | null;
  try {
    author = await getDb().author.findUnique({ where: { id }, select: { id: true } });
  } catch {
    redirect("/admin?notice=erro-publicacao-autor#autores");
  }
  if (!author) redirect("/admin?notice=autor-inexistente#autores");

  if (!publish) {
    let publishedBooks: number;
    try {
      publishedBooks = await getDb().book.count({ where: { authorId: id, published: true } });
    } catch {
      redirect("/admin?notice=erro-publicacao-autor#autores");
    }
    if (publishedBooks > 0) redirect("/admin?notice=autor-com-livros-publicados#autores");
  }

  try {
    await getDb().author.update({ where: { id }, data: { published: publish }, select: { id: true } });
  } catch {
    redirect("/admin?notice=erro-publicacao-autor#autores");
  }
  revalidateAuthors();
  redirect(`/admin?notice=${publish ? "autor-publicado" : "autor-retirado"}#autores`);
}

export async function deleteAuthorAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) redirect("/admin#autores");

  type Result =
    | { outcome: "deleted"; photoUrl: string | null }
    | { outcome: "missing" | "has-books" | "pending" | "error" };
  let result: Result;
  try {
    result = await getDb().$transaction(async (tx): Promise<Result> => {
      const author = await tx.author.findUnique({
        where: { id },
        select: { id: true, photoUrl: true, books: { select: { id: true }, take: 1 } },
      });
      if (!author) return { outcome: "missing" };
      if (author.books.length > 0) return { outcome: "has-books" };
      const pending = await tx.catalogChange.findFirst({
        where: { entityType: "AUTHOR", entityId: id, status: "PENDING" },
        select: { id: true },
      });
      if (pending) return { outcome: "pending" };
      await tx.author.delete({ where: { id } });
      return { outcome: "deleted", photoUrl: author.photoUrl };
    });
  } catch {
    result = { outcome: "error" };
  }

  if (result.outcome !== "deleted") {
    const notice = result.outcome === "has-books" ? "autor-com-livros" : result.outcome === "pending" ? "autor-com-pendencia" : result.outcome === "missing" ? "autor-inexistente" : "erro-excluir-autor";
    redirect(`/admin?notice=${notice}#autores`);
  }
  await removeStoredImage(result.photoUrl, "authors");
  revalidateAuthors();
  redirect("/admin?notice=autor-excluido#autores");
}
