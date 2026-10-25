import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/session";

// Parte do cabeçalho que depende da sessão (cookie): "Entrar" para visitantes,
// nome, Admin (se for o caso) e "Sair" para quem está logado.
export async function AccountLinks() {
  const user = await getCurrentUser();

  if (!user) return <Link href="/entrar">Entrar</Link>;

  const firstName = user.name.split(" ")[0];
  return (
    <>
      {user.role === "ADMIN" && <Link href="/admin">Admin</Link>}
      <span className="links-user">Olá, {firstName}</span>
      <form action={logoutAction}>
        <button type="submit" className="link-btn">
          Sair
        </button>
      </form>
    </>
  );
}
