"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
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

export async function saveAuthorAction(
  _previousState: AuthorFormState,
  formData: FormData,
): Promise<AuthorFormState> {
  await requireAdmin();
  const id = readText(formData, "id") || null;
  const values: AuthorFormValues = {
    name: readText(formData, "name"),
    bio: readText(formData, "bio"),
    color: readText(formData, "color") || EMPTY_VALUES.color,
  };
  const fieldErrors: NonNullable<AuthorFormState["fieldErrors"]> = {};

  if (values.name.length < 2 || values.name.length > 120) {
    fieldErrors.name = "Informe um nome entre 2 e 120 caracteres.";
  }
  if (values.bio.length < 10 || values.bio.length > 4000) {
    fieldErrors.bio = "Escreva uma biografia entre 10 e 4000 caracteres.";
  }
  if (!HEX_COLOR.test(values.color)) {
    fieldErrors.color = "Escolha uma cor válida para o perfil.";
  }
  const slug = slugify(values.name).slice(0, 120);
  if (!slug) fieldErrors.name = "O nome precisa conter letras ou números.";
  if (Object.keys(fieldErrors).length) {
    return { values, fieldErrors, error: "Corrija os campos destacados." };
  }

  try {
    const author = id
      ? await getDb().author.update({
          where: { id },
          data: { name: values.name, bio: values.bio, color: values.color },
          select: { id: true, name: true, slug: true, bio: true, color: true, photoUrl: true },
        })
      : await getDb().author.create({
          data: { name: values.name, slug, bio: values.bio, color: values.color },
          select: { id: true, name: true, slug: true, bio: true, color: true, photoUrl: true },
        });

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/autor/[slug]", "page");
    return {
      values,
      savedAuthor: author,
      success: id ? "Autor atualizado." : "Autor cadastrado.",
    };
  } catch (error) {
    if (isPrismaCode(error, "P2002")) {
      return {
        values,
        fieldErrors: { name: "Já existe um autor com esse nome ou endereço." },
        error: "Não foi possível salvar o autor informado.",
      };
    }
    if (id && isPrismaCode(error, "P2025")) {
      return { values, error: "Este autor não existe mais. Atualize a página." };
    }
    return { values, error: "Não foi possível salvar o autor agora. Tente novamente." };
  }
}
