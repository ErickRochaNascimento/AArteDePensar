import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { AdminAuthorsPanel } from "@/components/AdminAuthorsPanel";
import { AdminBooksPanel } from "@/components/AdminBooksPanel";
import { AdminSalesPanel } from "@/components/AdminSalesPanel";
import { requireStaff } from "@/lib/auth";
import { normalizeText } from "@/lib/data";
import { listPendingCatalogChanges } from "@/lib/catalog-changes";
import {
  listAllAuthorsForAdmin,
  listAllBooksForAdmin,
  listAllCategories,
  listAuthorOptions,
} from "@/lib/catalog";

export const metadata: Metadata = { title: "Painel da livraria" };

const NOTICE_COPY: Record<string, string> = {
  "livro-enviado": "A proposta de edição do livro foi enviada para aprovação.",
  "livro-confirmado": "A edição do livro foi confirmada e o formulário foi fechado.",
  "livro-publicado": "O livro foi publicado.",
  "livro-retirado": "O livro foi retirado do catálogo público.",
  "livro-excluido": "O livro foi excluído.",
  "livro-na-biblioteca": "O livro está na biblioteca de um usuário e não pode ser excluído.",
  "livro-com-pendencia": "Resolva a proposta pendente antes de excluir este livro.",
  "livro-inexistente": "O livro não foi encontrado.",
  "livro-sem-classificacao": "Selecione uma classificação indicativa antes de publicar este livro.",
  "erro-excluir-livro": "Não foi possível excluir o livro; verifique vínculos antes de tentar novamente.",
  "autor-precisa-ser-publicado": "Publique o autor antes de publicar o livro.",
  "erro-publicacao-livro": "Não foi possível alterar a publicação do livro.",
  "autor-enviado": "A proposta de edição do autor foi enviada para aprovação.",
  "autor-confirmado": "A edição do autor foi confirmada e o formulário foi fechado.",
  "autor-publicado": "O autor foi publicado.",
  "autor-retirado": "O autor foi retirado do catálogo público.",
  "autor-excluido": "O autor foi excluído.",
  "autor-inexistente": "O autor não foi encontrado.",
  "erro-excluir-autor": "Não foi possível excluir o autor; verifique os vínculos antes de tentar novamente.",
  "autor-com-livros": "Autores associados a livros não podem ser excluídos.",
  "autor-com-pendencia": "Resolva a proposta pendente antes de excluir este autor.",
  "autor-com-livros-publicados": "Retire primeiro os livros publicados deste autor.",
  "erro-publicacao-autor": "Não foi possível alterar a publicação do autor.",
  "proposta-aprovada": "A edição proposta foi confirmada.",
  "proposta-rejeitada": "A proposta foi rejeitada; o catálogo não foi alterado.",
  "proposta-ja-analisada": "Esta proposta já foi analisada por um administrador.",
  "proposta-invalida": "A proposta não passou pela validação e não foi aplicada.",
  "erro-na-proposta": "Não foi possível revisar a proposta. O catálogo permanece inalterado.",
};

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<p className="muted" aria-live="polite">Carregando painel…</p>}>
      <AuthorizedDashboard searchParams={searchParams} />
    </Suspense>
  );
}

async function AuthorizedDashboard({
  searchParams,
}: Pick<PageProps<"/admin">, "searchParams">) {
  const user = await requireStaff();
  const isAdmin = user.role === "ADMIN";
  const { qAutor, notice } = await searchParams;
  const [books, authors, categories, authorsForAdmin, pendingBooks, pendingAuthors] = await Promise.all([
    listAllBooksForAdmin(),
    listAuthorOptions(),
    listAllCategories(),
    listAllAuthorsForAdmin(),
    isAdmin ? listPendingCatalogChanges("BOOK") : Promise.resolve([]),
    isAdmin ? listPendingCatalogChanges("AUTHOR") : Promise.resolve([]),
  ]);

  const authorSearch = typeof qAutor === "string" ? qAutor.trim().slice(0, 100) : "";
  const normalizedAuthorSearch = normalizeText(authorSearch);
  const visibleAuthors = normalizedAuthorSearch
    ? authorsForAdmin.filter((author) => normalizeText(author.name).includes(normalizedAuthorSearch))
    : authorsForAdmin;
  const publishedCount = books.filter((book) => book.published).length;
  const draftCount = books.length - publishedCount;
  const noticeText = typeof notice === "string" ? NOTICE_COPY[notice] : undefined;
  const errorNotices = new Set([
    "livro-na-biblioteca", "livro-com-pendencia", "livro-inexistente", "erro-excluir-livro",
    "autor-precisa-ser-publicado", "livro-sem-classificacao", "erro-publicacao-livro", "autor-inexistente", "erro-excluir-autor",
    "autor-com-livros", "autor-com-pendencia", "autor-com-livros-publicados", "erro-publicacao-autor",
    "proposta-ja-analisada", "proposta-invalida", "erro-na-proposta",
  ]);

  const dateParts = isAdmin ? new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date()) : [];
  const datePart = (type: string) => dateParts.find((part) => part.type === type)?.value ?? "";
  const year = datePart("year");
  const month = datePart("month");
  const today = `${year}-${month}-${datePart("day")}`;
  const monthStart = `${year}-${month}-01`;

  return (
    <div className="admin admin-dashboard">
      <nav className="side admin-nav" aria-label="Seções do painel">
        {isAdmin && <a href="#vendas">Vendas</a>}
        <a href="#livros">Livros</a>
        <a href="#autores">Autores</a>
        {isAdmin && <Link href="/admin/usuarios">Gerenciar usuários</Link>}
      </nav>

      <div className="admin-content">
        <header className="admin-header">
          <div>
            <p className="tag">{isAdmin ? "Área administrativa" : "Equipe da livraria"}</p>
            <h1>{isAdmin ? "Painel da livraria" : "Painel do Funcionário"}</h1>
            {!isAdmin && <p className="muted">Cadastros novos são rascunhos; edições de itens existentes aguardam confirmação de Admin.</p>}
          </div>
          <div className="admin-summary" aria-label="Resumo do catálogo">
            <span><b>{publishedCount}</b> publicados</span>
            <span><b>{draftCount}</b> rascunhos</span>
            <span><b>{authorsForAdmin.length}</b> autores</span>
          </div>
        </header>

        {noticeText && <p className={`${typeof notice === "string" && errorNotices.has(notice) ? "error" : "ok"} admin-notice`} role="status">{noticeText}</p>}

        {isAdmin && (
          <section className="admin-section" id="vendas" aria-labelledby="sales-heading">
            <div className="admin-section-heading">
              <p className="tag">Visão comercial</p>
              <h2 id="sales-heading">Vendas</h2>
            </div>
            <AdminSalesPanel initialStart={monthStart} initialEnd={today} />
          </section>
        )}

        <section className="admin-section" id="livros" aria-labelledby="books-heading">
          <div className="admin-section-heading">
            <p className="tag">Catálogo</p>
            <h2 id="books-heading">Livros</h2>
          </div>
          <AdminBooksPanel
            books={books}
            authors={authors}
            categories={categories}
            isAdmin={isAdmin}
            publicationError={notice === "autor-precisa-ser-publicado" || notice === "livro-sem-classificacao" || notice === "erro-publicacao-livro"}
            pendingChanges={pendingBooks}
          />
        </section>

        <section className="admin-section" id="autores" aria-labelledby="authors-heading">
          <div className="admin-section-heading">
            <p className="tag">Pessoas e perfis</p>
            <h2 id="authors-heading">Autores</h2>
          </div>
          <AdminAuthorsPanel
            authors={visibleAuthors}
            totalAuthors={authorsForAdmin.length}
            searchTerm={authorSearch}
            isAdmin={isAdmin}
            pendingChanges={pendingAuthors}
          />
        </section>
      </div>
    </div>
  );
}
