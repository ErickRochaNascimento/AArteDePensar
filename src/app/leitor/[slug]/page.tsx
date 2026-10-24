import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BOOKS, getBook } from "@/lib/data";
import { ReaderClient } from "@/components/ReaderClient";

export function generateStaticParams() {
  return BOOKS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/leitor/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const book = getBook(slug);
  return { title: book ? `Lendo ${book.title}` : "Leitor" };
}

export default async function LeitorPage({ params }: PageProps<"/leitor/[slug]">) {
  const { slug } = await params;
  const book = getBook(slug);
  if (!book) notFound();

  // Entrega 3: verificar aqui (no servidor) se o usuário logado comprou este livro.
  return <ReaderClient title={book.title} />;
}
