import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { listPublishedBooks } from "@/lib/catalog";
import { normalizeText } from "@/lib/data";
import { AccountNav } from "@/components/AccountNav";
import { Cover } from "@/components/Cover";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Meus Livros" };

// Progresso de leitura de exemplo. Na Entrega 3 a estante vem das compras do usuário.
const DEMO_PROGRESS = [62, 18, 100, 0];

export default function MeusLivrosPage({ searchParams }: PageProps<"/meus-livros">) {
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
      <AuthenticatedBookshelf searchParams={searchParams} />
    </Suspense>
  );
}

async function AuthenticatedBookshelf({
  searchParams,
}: Pick<PageProps<"/meus-livros">, "searchParams">) {
  const user = await requireUser();
  const { q } = await searchParams;
  const term = typeof q === "string" ? q.trim().slice(0, 100) : "";

  const owned = (await listPublishedBooks())
    .slice(0, DEMO_PROGRESS.length)
    .map((book, i) => ({ book, pct: DEMO_PROGRESS[i] }));

  const needle = normalizeText(term);
  const shelf = needle
    ? owned.filter(({ book }) => normalizeText(`${book.title} ${book.author}`).includes(needle))
    : owned;

  return (
    <div className="prof">
      <AccountNav current="livros" />

      <div>
        <h1 style={{ fontSize: 26, marginBottom: 6 }}>Olá, {user.name}</h1>
        <p className="muted" style={{ margin: "0 0 16px" }}>
          Você tem {owned.length} {owned.length === 1 ? "livro" : "livros"} na sua estante.
        </p>

        <form className="shelf-search" action="/meus-livros" method="get" role="search">
          <label className="sr-only" htmlFor="shelf-q">
            Pesquisar na minha estante
          </label>
          <input
            id="shelf-q"
            name="q"
            type="search"
            maxLength={100}
            defaultValue={term}
            placeholder="Pesquisar por título ou autor"
          />
          <button type="submit" className="btn sm">
            Pesquisar
          </button>
          {term && (
            <Link className="btn sm ghost" href="/meus-livros">
              Limpar
            </Link>
          )}
        </form>

        {term && (
          <p className="muted" style={{ margin: "0 0 14px" }} aria-live="polite">
            {shelf.length} {shelf.length === 1 ? "resultado" : "resultados"} para “{term}”
          </p>
        )}

        {shelf.length === 0 ? (
          <p className="muted">
            {term
              ? "Nenhum livro da sua estante corresponde à pesquisa."
              : "Sua estante está vazia. Quando você comprar um livro, ele aparece aqui."}
          </p>
        ) : (
          <div className="shelf">
            {shelf.map(({ book: b, pct }) => (
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
            ))}
          </div>
        )}

        <p style={{ marginTop: 28 }}>
          <Link href="/meus-livros/dados">Ver e gerenciar meus dados →</Link>
        </p>
      </div>
    </div>
  );
}
