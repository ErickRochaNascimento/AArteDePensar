"use server";

import argon2 from "argon2";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import type { AccountFormState, AccountValues } from "@/lib/account-types";
import { getDb } from "@/lib/db";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function updateAccountAction(
  _previousState: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const user = await requireUser("/meus-livros/dados");
  const values: AccountValues = {
    name: readText(formData, "name").trim(),
    email: readText(formData, "email").trim().toLowerCase(),
  };
  const password = readText(formData, "currentPassword");
  const fieldErrors: NonNullable<AccountFormState["fieldErrors"]> = {};

  if (values.name.length < 2 || values.name.length > 120) {
    fieldErrors.name = "Informe um nome entre 2 e 120 caracteres.";
  }
  if (values.email.length > 191 || !EMAIL_PATTERN.test(values.email)) {
    fieldErrors.email = "Informe um e-mail válido.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { values, fieldErrors, error: "Corrija os campos destacados." };
  }

  let existingUser: { email: string; passwordHash: string } | null;
  try {
    existingUser = await getDb().user.findUnique({
      where: { id: user.id },
      select: { email: true, passwordHash: true },
    });
  } catch {
    return { values, error: "Não foi possível consultar seus dados agora. Tente novamente." };
  }

  if (!existingUser) {
    return { values, error: "Não foi possível localizar esta conta. Entre novamente." };
  }

  if (values.email !== existingUser.email) {
    if (!password) {
      return {
        values,
        fieldErrors: { email: "Informe a senha atual para alterar o e-mail." },
        error: "Confirme sua identidade antes de alterar o e-mail.",
      };
    }

    let passwordMatches = false;
    try {
      passwordMatches = await argon2.verify(existingUser.passwordHash, password);
    } catch {
      passwordMatches = false;
    }
    if (!passwordMatches) {
      return {
        values,
        fieldErrors: { email: "A senha atual não confere; o e-mail não foi alterado." },
        error: "Não foi possível confirmar sua identidade.",
      };
    }
  }

  try {
    await getDb().user.update({
      where: { id: user.id },
      data: values,
      select: { id: true },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        values,
        fieldErrors: { email: "Este e-mail já está cadastrado." },
        error: "Não foi possível salvar os dados informados.",
      };
    }
    return { values, error: "Não foi possível salvar seus dados agora. Tente novamente." };
  }

  revalidatePath("/meus-livros/dados");
  revalidatePath("/", "layout");
  return { values, success: "Seus dados foram atualizados." };
}
