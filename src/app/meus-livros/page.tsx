import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { AccountNav } from "@/components/AccountNav";
import { Cover } from "@/components/Cover";
import { requireUser } from "@/lib/auth";
import { normalizeText } from "@/lib/data";
import { listUserLibrary } from "@/lib/library";

export const metadata: Metadata = { title: "Meus Livros" };

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
  const library = await listUserLibrary(user.id);
  const needle = normalizeText(term);
  const shelf = needle
    ? library.filter(({ book }) => normalizeText(`${book.title} ${book.author}`).includes(needle))
    : library;

  return (
    <div className="prof">
      <AccountNav current="livros" />

      <div>
        <h1 style={{ fontSize: 26, marginBottom: 6 }}>Olá, {user.name}</h1>
        <p className="muted" style={{ margin: "0 0 16px" }}>
          Você tem {library.length} {library.length === 1 ? "livro" : "livros"} na sua estante.
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
              : "Sua estante está vazia. Livros serão liberados após confirmação de compra na etapa de checkout."}
          </p>
        ) : (
          <div className="shelf">
            {shelf.map((item) => {
              const { book } = item;
              const pct = item.progressPercent;

              return (
                <div className="own" key={item.libraryItemId}>
                  <Cover book={book} />
                  <div>
                    <b>{book.title}</b>
                    <small className="muted">{book.author}</small>
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
                      <Link className="btn sm" href={`/leitor/${encodeURIComponent(book.slug)}`}>
                        Abrir leitor
                      </Link>
                      {item.hasEbook && (
                        <a className="btn sm ghost" href={`/api/library/${encodeURIComponent(book.slug)}/file?download=1`}>
                          Baixar {item.ebookMimeType === "application/pdf" ? "PDF" : "EPUB"}
                        </a>
                      )}
                    </div>
                    {!item.hasEbook && <small className="muted">O arquivo digital deste livro ainda não foi cadastrado.</small>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p style={{ marginTop: 28 }}>
          <Link href="/meus-livros/dados">Ver e gerenciar meus dados →</Link>
        </p>
      </div>
    </div>
  );
}
