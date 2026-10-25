import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RATING_DISTRIBUTION, REVIEWS } from "@/lib/data";
import { getPublishedBook, listRelatedBooks } from "@/lib/catalog";
import { DynamicMarker } from "@/components/DynamicMarker";
import { BookCard } from "@/components/BookCard";
import { BuyBox } from "@/components/BuyBox";
import { Cover } from "@/components/Cover";
import { ReviewForm } from "@/components/ReviewForm";
import { Stars } from "@/components/Stars";

// Título e descrição vêm do banco a cada requisição.
export async function generateMetadata({
  params,
}: PageProps<"/livro/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const book = await getPublishedBook(slug);
  return book
    ? { title: book.title, description: book.synopsis }
    : { title: "Livro não encontrado" };
}

export default function BookPage({ params }: PageProps<"/livro/[slug]">) {
  return (
    <>
      <Suspense fallback={<p className="muted" aria-live="polite">Carregando livro…</p>}>
        <BookDetail params={params} />
      </Suspense>
      <DynamicMarker />
    </>
  );
}

async function BookDetail({ params }: Pick<PageProps<"/livro/[slug]">, "params">) {
  const { slug } = await params;
  const book = await getPublishedBook(slug);
  if (!book) notFound();

  const related = await listRelatedBooks(book, 6);
  const hasReviews = book.reviewCount > 0;

  return (
    <>
      <div className="detail">
        <div>
          <Cover book={book} />
        </div>

        <div>
          <span className="tag">{book.category}</span>
          <h1 style={{ marginTop: 10 }}>{book.title}</h1>
          <p className="muted" style={{ margin: "8px 0 0" }}>
            por <Link href={`/autor/${book.authorSlug}`}>{book.author}</Link>
            {hasReviews ? (
              <>
                {" "}
                · <Stars value={book.rating} /> {book.rating.toString().replace(".", ",")} (
                {book.reviewCount} avaliações)
              </>
            ) : (
              <> · Sem avaliações ainda</>
            )}
          </p>

          <dl className="meta">
            <div>
              <dt>Ano</dt>
              <dd>{book.year}</dd>
            </div>
            <div>
              <dt>Páginas</dt>
              <dd>{book.pages}</dd>
            </div>
            <div>
              <dt>Idioma</dt>
              <dd>Português</dd>
            </div>
            <div>
              <dt>Formatos</dt>
              <dd>EPUB, PDF</dd>
            </div>
          </dl>

          <p>{book.synopsis}</p>

          <h2 style={{ marginTop: 28, fontSize: 20 }}>Avaliações</h2>
          {hasReviews ? (
            <>
              <div style={{ display: "grid", gap: 4, marginBlock: 14, maxWidth: 360 }}>
                {RATING_DISTRIBUTION.map(([n, pct]) => (
                  <div className="bar" key={n}>
                    <span>{n}★</span>
                    <i>
                      <b style={{ width: `${pct}%` }} />
                    </i>
                    <span>{pct}%</span>
                  </div>
                ))}
              </div>
              {REVIEWS.map((r) => (
                <div className="rev" key={r.name}>
                  <b>
                    {r.name} <Stars value={r.stars} />
                  </b>
                  <p>{r.text}</p>
                </div>
              ))}
            </>
          ) : (
            <p className="muted">Este livro ainda não recebeu avaliações.</p>
          )}
          <ReviewForm />
        </div>

        <BuyBox book={book} />
      </div>

      {related.length > 0 && (
        <section className="sec">
          <h2>Mais de {book.author} e outras leituras</h2>
          <div className="row">
            {related.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
