import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

/**
 * Exige usuário logado. Quem não está logado vai para /entrar e, depois de
 * entrar, volta para `next`.
 */
export async function requireUser(next = "/meus-livros") {
  const user = await getCurrentUser();
  if (!user) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin() {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") redirect("/meus-livros");
  return user;
}
