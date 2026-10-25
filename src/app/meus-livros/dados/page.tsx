import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { AccountNav } from "@/components/AccountNav";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Meus dados" };

export default function MeusDadosPage() {
  return (
    <Suspense
      fallback={
        <div className="prof">
          <p className="muted" aria-live="polite">
            Carregando seus dados…
          </p>
        </div>
      }
    >
      <AuthenticatedProfile />
    </Suspense>
  );
}

async function AuthenticatedProfile() {
  const user = await requireUser("/meus-livros/dados");

  return (
    <div className="prof">
      <AccountNav current="dados" />

      <div>
        <p style={{ margin: "0 0 10px" }}>
          <Link href="/meus-livros">← Voltar para Meus livros</Link>
        </p>
        <h1 style={{ fontSize: 26, marginBottom: 6 }}>Meus dados</h1>
        <p className="muted" style={{ margin: "0 0 20px" }}>
          Informações da sua conta.
        </p>

        <div className="panel" style={{ maxWidth: 520 }}>
          <label>
            Nome
            <input type="text" value={user.name} readOnly />
          </label>
          <label>
            E-mail
            <input type="email" value={user.email} readOnly />
          </label>
          <small className="muted">
            A edição dos dados da conta será liberada em uma próxima etapa.
          </small>
        </div>
      </div>
    </div>
  );
}
