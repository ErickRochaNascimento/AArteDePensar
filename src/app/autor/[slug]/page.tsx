import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense, type CSSProperties } from "react";
import { initials } from "@/lib/data";
import { getAuthorWithBooks } from "@/lib/catalog";
import { DynamicMarker } from "@/components/DynamicMarker";
import { BookCard } from "@/components/BookCard";

export async function generateMetadata({
  params,
}: PageProps<"/autor/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = await getAuthorWithBooks(slug);
  return found
    ? { title: found.author.name, description: found.author.bio }
    : { title: "Autor não encontrado" };
}

export default function AuthorPage({ params }: PageProps<"/autor/[slug]">) {
  return (
    <>
      <Suspense fallback={<p className="muted" aria-live="polite">Carregando autor…</p>}>
        <AuthorDetail params={params} />
      </Suspense>
      <DynamicMarker />
    </>
  );
}

async function AuthorDetail({ params }: Pick<PageProps<"/autor/[slug]">, "params">) {
  const { slug } = await params;
  const found = await getAuthorWithBooks(slug);
  if (!found) notFound();

  const { author, books } = found;

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
          {author.photoUrl ? (
            <Image className="avatar-photo" src={author.photoUrl} alt="" fill sizes="150px" unoptimized />
          ) : initials(author.name)}
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
