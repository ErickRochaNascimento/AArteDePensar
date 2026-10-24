import { Suspense } from "react";
import { AUTHORS, BOOKS, CATEGORIES } from "@/lib/data";
import { AuthorAvatar } from "@/components/AuthorAvatar";
import { BookCard } from "@/components/BookCard";
import { CatalogGrid } from "@/components/CatalogGrid";

// Ranking de exemplo; na Entrega 4 virá das vendas reais.
const BEST_SELLERS = [...BOOKS].reverse().slice(0, 6);

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <>
      {/* A busca (?q=) depende da requisição, por isso fica dentro de Suspense. */}
      <Suspense fallback={<CatalogSection />}>
        <SearchedCatalog searchParams={searchParams} />
      </Suspense>

      <section className="sec" id="mais-vendidos">
        <h2>Mais vendidos da semana</h2>
        <div className="row">
          {BEST_SELLERS.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </section>

      <section className="sec" id="autores">
        <h2>Autores</h2>
        <div className="authors">
          {AUTHORS.map((a) => (
            <AuthorAvatar key={a.slug} author={a} />
          ))}
        </div>
      </section>
    </>
  );
}

async function SearchedCatalog({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const { q } = await searchParams;
  const raw = typeof q === "string" ? q.trim() : "";
  return <CatalogSection term={raw} />;
}

function CatalogSection({ term = "" }: { term?: string }) {
  const needle = term.toLowerCase();
  const books = needle
    ? BOOKS.filter((b) => `${b.title} ${b.author}`.toLowerCase().includes(needle))
    : BOOKS;

  return (
    <section className="sec" id="catalogo">
      <div className="sec-head">
        <h2>{term ? `Resultados para “${term}”` : "Livros digitais para ler agora"}</h2>
      </div>
      {books.length > 0 ? (
        <CatalogGrid books={books} categories={CATEGORIES} />
      ) : (
        <p className="muted">Nenhum livro encontrado. Tente buscar por outro título ou autor.</p>
      )}
    </section>
  );
}
