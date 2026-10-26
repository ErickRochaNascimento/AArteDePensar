import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { getDb } from "@/lib/db";

const COOKIE_NAME = "livraria_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "EMPLOYEE" | "ADMIN";
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function isSecureCookie() {
  const configured = process.env.AUTH_COOKIE_SECURE;
  if (configured === "true") return true;
  if (configured === "false") return false;
  return process.env.NODE_ENV === "production";
}

export const getCurrentUser = cache(
  async (): Promise<AuthenticatedUser | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    // A validade de uma sessão depende do horário da requisição, não do build.
    await connection();

    const session = await getDb().session.findFirst({
      where: {
        tokenHash: hashToken(token),
        expiresAt: { gt: new Date() },
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return session?.user ?? null;
  },
);

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await getDb().session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function revokeCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  try {
    if (token) {
      await getDb().session.deleteMany({
        where: { tokenHash: hashToken(token) },
      });
    }
  } finally {
    cookieStore.delete(COOKIE_NAME);
  }
}
