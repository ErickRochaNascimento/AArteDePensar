import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";

// Menu lateral da área do cliente (Meus livros e Meus dados).
export function AccountNav({ current }: { current: "livros" | "dados" }) {
  return (
    <nav className="side" aria-label="Área do cliente">
      <Link href="/meus-livros" aria-current={current === "livros" ? "page" : undefined}>
        Meus livros
      </Link>
      <Link href="/meus-livros/dados" aria-current={current === "dados" ? "page" : undefined}>
        Meus dados
      </Link>
      <form action={logoutAction}>
        <button type="submit">Sair</button>
      </form>
    </nav>
  );
}
