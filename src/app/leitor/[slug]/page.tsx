import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { getPublishedBook } from "@/lib/catalog";
import { getUserLibraryBook } from "@/lib/library";
import { DynamicMarker } from "@/components/DynamicMarker";
import { ReaderClient } from "@/components/ReaderClient";

export async function generateMetadata({
  params,
}: PageProps<"/leitor/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const book = await getPublishedBook(slug);
  return { title: book ? `Lendo ${book.title}` : "Leitor" };
}

export default function LeitorPage({ params }: PageProps<"/leitor/[slug]">) {
  return (
    <>
      <Suspense fallback={<p className="muted" aria-live="polite">Abrindo leitor…</p>}>
        <Reader params={params} />
      </Suspense>
      <DynamicMarker />
    </>
  );
}

async function Reader({ params }: Pick<PageProps<"/leitor/[slug]">, "params">) {
  const { slug } = await params;
  const user = await requireUser(`/leitor/${encodeURIComponent(slug)}`);
  const libraryItem = await getUserLibraryBook(user.id, slug);

  // Retorna a mesma resposta para livro inexistente ou sem propriedade, sem vazar conteúdo.
  if (!libraryItem) notFound();

  return <ReaderClient title={libraryItem.book.title} />;
}
