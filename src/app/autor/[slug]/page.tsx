import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { AUTHORS, booksByAuthor, getAuthor, initials } from "@/lib/data";
import { BookCard } from "@/components/BookCard";

export function generateStaticParams() {
  return AUTHORS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/autor/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthor(slug);
  return author
    ? { title: author.name, description: author.bio }
    : { title: "Autor não encontrado" };
}

export default async function AuthorPage({ params }: PageProps<"/autor/[slug]">) {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) notFound();

  const books = booksByAuthor(author.slug);

  return (
    <>
      <div className="author-head">
        <div
          className="av"
          style={
            {
              "--c1": author.color,
              width: 150,
              height: 150,
              fontSize: 44,
            } as CSSProperties
          }
        >
          {initials(author.name)}
        </div>
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <h1 style={{ fontSize: 36 }}>{author.name}</h1>
          <p className="muted" style={{ maxWidth: "62ch" }}>
            {author.bio}
          </p>
          <div className="fmt" style={{ marginTop: 8 }}>
            <span>
              {books.length} {books.length === 1 ? "livro" : "livros"}
            </span>
          </div>
        </div>
      </div>

      <section className="sec">
        <h2>Livros do autor</h2>
        {books.length > 0 ? (
          <div className="row">
            {books.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        ) : (
          <p className="muted">Ainda não há livros publicados por este autor.</p>
        )}
      </section>
    </>
  );
}
