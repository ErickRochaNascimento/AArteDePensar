import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

/** Exige usuário logado; após entrar, retorna à rota solicitada. */
export async function requireUser(next = "/meus-livros") {
  const user = await getCurrentUser();
  if (!user) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  return user;
}

/** Exige ADMIN ou EMPLOYEE para as áreas de operação do catálogo. */
export async function requireStaff(next = "/admin") {
  const user = await requireUser(next);
  if (user.role !== "ADMIN" && user.role !== "EMPLOYEE") redirect("/meus-livros");
  return user;
}

/** Exige ADMIN para publicação, aprovações, gestão de usuários e exclusões. */
export async function requireAdmin() {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") redirect("/meus-livros");
  return user;
}
