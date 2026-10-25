import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { listPublishedBooks } from "@/lib/catalog";
import { Cover } from "@/components/Cover";
import { logoutAction } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Meus Livros" };

// Progresso de leitura de exemplo. Na Entrega 3 a estante vem das compras do usuário.
const DEMO_PROGRESS = [62, 18, 100, 0];

export default function MeusLivrosPage() {
  return (
    <Suspense
      fallback={
        <div className="prof">
          <p className="muted" aria-live="polite">
            Carregando sua estante…
          </p>
        </div>
      }
    >
      <AuthenticatedBookshelf />
    </Suspense>
  );
}

async function AuthenticatedBookshelf() {
  const user = await requireUser();
  const shelf = (await listPublishedBooks()).slice(0, DEMO_PROGRESS.length);
  return (
    <div className="prof">
      <nav className="side" aria-label="Área do cliente">
        <Link href="/meus-livros" aria-current="page">
          Meus livros
        </Link>
        <Link href="/meus-livros#dados">Meus dados</Link>
        <form action={logoutAction}>
          <button type="submit">Sair</button>
        </form>
      </nav>

      <div>
        <h1 style={{ fontSize: 26, marginBottom: 6 }}>Olá, {user.name}</h1>
        <p className="muted" style={{ margin: "0 0 20px" }}>
          Você tem {shelf.length} {shelf.length === 1 ? "livro" : "livros"} na sua estante.
        </p>

        <div className="shelf">
          {shelf.map((b, i) => {
            const pct = DEMO_PROGRESS[i];
            return (
              <div className="own" key={b.id}>
                <Cover book={b} />
                <div>
                  <b>{b.title}</b>
                  <small className="muted">{b.author}</small>
                  <div
                    className="prog"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${pct}% lido`}
                  >
                    <b style={{ width: `${pct}%` }} />
                  </div>
                  <small className="muted">
                    {pct === 0 ? "Não iniciado" : pct === 100 ? "Concluído" : `${pct}% lido`}
                  </small>
                  <div className="acts">
                    <Link className="btn sm" href={`/leitor/${b.slug}`}>
                      {pct ? "Continuar" : "Ler online"}
                    </Link>
                    {/* Entrega 3: link para a rota protegida de download */}
                    <button type="button" className="btn sm ghost">
                      Baixar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="panel" id="dados" style={{ marginTop: 30, maxWidth: 520 }}>
          <h2 style={{ fontSize: 18 }}>Meus dados</h2>
          <label>
            Nome
            <input type="text" defaultValue={user.name} />
          </label>
          <label>
            E-mail
            <input type="email" defaultValue={user.email} />
          </label>
          <div>
            <button type="button" className="btn sm">
              Salvar alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
