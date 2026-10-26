import { Suspense } from "react";
import { connection } from "next/server";
import { listAuthorsWithBooks, listBestSellers, listPublishedBooks } from "@/lib/catalog";
import { AuthorAvatar } from "@/components/AuthorAvatar";
import { BookCard } from "@/components/BookCard";
import { Carousel } from "@/components/Carousel";
import { CatalogCarousel } from "@/components/CatalogCarousel";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <>
      {/* A busca (?q=) depende da requisição e o catálogo vem do banco: tudo em Suspense. */}
      <Suspense fallback={<SectionFallback title="Livros digitais para ler agora" id="catalogo" />}>
        <SearchedCatalog searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<SectionFallback title="Mais vendidos da semana" id="mais-vendidos" />}>
        <BestSellers />
      </Suspense>

      <Suspense fallback={<SectionFallback title="Autores" id="autores" />}>
        <Authors />
      </Suspense>
    </>
  );
}

function SectionFallback({ title, id }: { title: string; id: string }) {
  return (
    <section className="sec" id={id}>
      <h2>{title}</h2>
      <p className="muted" aria-live="polite">
        Carregando…
      </p>
    </section>
  );
}

async function SearchedCatalog({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  await connection();
  const { q } = await searchParams;
  const term = typeof q === "string" ? q.trim().slice(0, 100) : "";
  const books = await listPublishedBooks(term);

  return (
    <section className="sec" id="catalogo">
      <div className="sec-head">
        <h2>{term ? `Resultados para “${term}”` : "Livros digitais para ler agora"}</h2>
      </div>
      {books.length > 0 ? (
        <CatalogCarousel books={books} />
      ) : (
        <p className="muted">
          {term
            ? "Nenhum livro encontrado. Tente buscar por outro título ou autor."
            : "Ainda não há livros publicados no catálogo."}
        </p>
      )}
    </section>
  );
}

async function BestSellers() {
  await connection();
  const books = await listBestSellers(8);
  if (books.length === 0) return null;

  return (
    <section className="sec" id="mais-vendidos">
      <h2>Mais vendidos da semana</h2>
      <Carousel label="Mais vendidos da semana">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </Carousel>
    </section>
  );
}

async function Authors() {
  await connection();
  const authors = await listAuthorsWithBooks();
  if (authors.length === 0) return null;

  return (
    <section className="sec" id="autores">
      <h2>Autores</h2>
      <Carousel label="Autores" variant="authors" loop>
        {authors.map((author) => (
          <AuthorAvatar key={author.slug} author={author} />
        ))}
      </Carousel>
    </section>
  );
}
