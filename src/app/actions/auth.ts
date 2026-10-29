"use server";

import "server-only";

import argon2 from "argon2";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import type { AuthActionState } from "@/lib/auth-types";
import { safeNext } from "@/lib/safe-redirect";
import { createSession, revokeCurrentSession } from "@/lib/session";
import { TERMS_VERSION } from "@/lib/legal";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Hash fictício para gastar o mesmo tempo quando o e-mail não existe, evitando
// revelar por tempo de resposta quais e-mails têm conta.
let dummyHash: Promise<string> | undefined;
function getDummyHash() {
  dummyHash ??= argon2.hash("senha-ficticia-para-tempo-constante", {
    type: argon2.argon2id,
  });
  return dummyHash;
}

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

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = readText(formData, "name").trim();
  const email = readText(formData, "email").trim().toLowerCase();
  const password = readText(formData, "password");
  const acceptedAgeAndTerms = formData.get("ageAndTermsConsent") === "accepted";

  if (name.length < 2 || name.length > 120) {
    return { error: "Informe um nome entre 2 e 120 caracteres." };
  }
  if (email.length > 191 || !EMAIL_PATTERN.test(email)) {
    return { error: "Informe um e-mail válido." };
  }
  if (password.length < 8 || password.length > 128) {
    return { error: "A senha deve ter entre 8 e 128 caracteres." };
  }
  if (!acceptedAgeAndTerms) {
    return { error: "Confirme a idade mínima e aceite os Termos de Uso para criar uma conta." };
  }

  let user: { id: string };
  try {
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });
    user = await getDb().user.create({
      data: {
        name,
        email,
        passwordHash,
        termsAcceptedAt: new Date(),
        termsVersion: TERMS_VERSION,
      },
      select: { id: true },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Este e-mail já está cadastrado. Tente entrar." };
    }
    return { error: "Não foi possível criar a conta agora. Tente novamente." };
  }

  try {
    await createSession(user.id);
  } catch {
    return {
      error: "Sua conta foi criada, mas não foi possível iniciar a sessão. Tente entrar.",
    };
  }

  redirect(safeNext(formData.get("next")));
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readText(formData, "email").trim().toLowerCase();
  const password = readText(formData, "password");

  if (!email || email.length > 191 || !EMAIL_PATTERN.test(email) || !password) {
    return { error: "E-mail ou senha incorretos." };
  }

  let user: { id: string; passwordHash: string } | null;
  try {
    user = await getDb().user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });
  } catch {
    return { error: "Não foi possível entrar agora. Tente novamente." };
  }

  let passwordMatches = false;
  try {
    passwordMatches = await argon2.verify(
      user ? user.passwordHash : await getDummyHash(),
      password,
    );
  } catch {
    passwordMatches = false;
  }

  if (!user || !passwordMatches) {
    return { error: "E-mail ou senha incorretos." };
  }

  try {
    await createSession(user.id);
  } catch {
    return { error: "Não foi possível iniciar a sessão. Tente novamente." };
  }

  redirect(safeNext(formData.get("next")));
}

export async function logoutAction() {
  try {
    await revokeCurrentSession();
  } catch {
    // O cookie é removido em finally; uma falha no banco não mantém a sessão no navegador.
  }
  redirect("/entrar?desconectado=1");
}
