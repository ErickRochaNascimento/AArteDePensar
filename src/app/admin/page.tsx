import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import Link from "next/link";
import { AdminSalesPanel } from "@/components/AdminSalesPanel";
import { AuthorAdminForm } from "@/components/AuthorAdminForm";
import { BookAdminForm } from "@/components/BookAdminForm";
import { BookMediaManager } from "@/components/BookMediaManager";
import { setBookPublishedAction } from "@/app/actions/catalog";
import { requireAdmin } from "@/lib/auth";
import { formatBRL, normalizeText } from "@/lib/data";
import {
  listAllAuthorsForAdmin,
  listAllBooksForAdmin,
  listAllCategories,
  listAuthorOptions,
} from "@/lib/catalog";

export const metadata: Metadata = { title: "Painel da livraria" };

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<p className="muted" aria-live="polite">Carregando painel…</p>}>
      <AuthorizedAdminDashboard searchParams={searchParams} />
    </Suspense>
  );
}

async function AuthorizedAdminDashboard({
  searchParams,
}: Pick<PageProps<"/admin">, "searchParams">) {
  await requireAdmin();
  const { editar, editarAutor, salvo, erro, qAutor } = await searchParams;
  const [books, authors, categories, authorsForAdmin] = await Promise.all([
    listAllBooksForAdmin(),
    listAuthorOptions(),
    listAllCategories(),
    listAllAuthorsForAdmin(),
  ]);

  const editingBook = typeof editar === "string" ? books.find((book) => book.id === editar) : undefined;
  const editingAuthor = typeof editarAutor === "string"
    ? authorsForAdmin.find((author) => author.id === editarAutor)
    : undefined;
  const authorSearch = typeof qAutor === "string" ? qAutor.trim().slice(0, 100) : "";
  const normalizedAuthorSearch = normalizeText(authorSearch);
  const visibleAuthors = normalizedAuthorSearch
    ? authorsForAdmin.filter((author) => normalizeText(author.name).includes(normalizedAuthorSearch))
    : authorsForAdmin;
  const publishedCount = books.filter((book) => book.published).length;
  const draftCount = books.length - publishedCount;
  const now = new Date();
  const monthStart = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
  const today = now.toISOString().slice(0, 10);

  return (
    <div className="admin admin-dashboard">
      <nav className="side admin-nav" aria-label="Seções do painel administrativo">
        <a href="#vendas">Vendas</a>
        <a href="#livros">Livros</a>
        <a href="#autores">Autores</a>
      </nav>

      <div className="admin-content">
        <header className="admin-header">
          <div>
            <p className="tag">Área administrativa</p>
            <h1>Painel da livraria</h1>
          </div>
          <div className="admin-summary" aria-label="Resumo do catálogo">
            <span><b>{publishedCount}</b> publicados</span>
            <span><b>{draftCount}</b> rascunhos</span>
            <span><b>{authorsForAdmin.length}</b> autores</span>
          </div>
        </header>

        <section className="admin-section" id="vendas" aria-labelledby="sales-heading">
          <div className="admin-section-heading">
            <p className="tag">Visão comercial</p>
            <h2 id="sales-heading">Vendas</h2>
          </div>
          <AdminSalesPanel initialStart={monthStart} initialEnd={today} />
        </section>

        <section className="admin-section" id="livros" aria-labelledby="books-heading">
          <div className="admin-section-heading">
            <p className="tag">Catálogo</p>
            <h2 id="books-heading">Livros</h2>
          </div>
          <div className="panel">
            <h3>{editingBook ? `Editar livro: ${editingBook.title}` : "Cadastrar livro"}</h3>
            {salvo === "1" && <p className="ok" role="status">Livro salvo. Se ainda é rascunho, publique-o na lista abaixo.</p>}
            {erro === "publicacao" && <p className="error" role="alert">Não foi possível alterar a publicação do livro. Tente novamente.</p>}
            {typeof editar === "string" && !editingBook && <p className="error" role="alert">Livro não encontrado. Você pode cadastrar um novo abaixo.</p>}
            <BookAdminForm
              key={editingBook?.id ?? "novo"}
              authors={authors}
              categories={categories}
              initial={editingBook ? {
                id: editingBook.id,
                slug: editingBook.slug,
                title: editingBook.title,
                authorId: editingBook.authorId,
                year: String(editingBook.year),
                category: editingBook.category,
                pages: String(editingBook.pages),
                price: editingBook.price.toFixed(2).replace(".", ","),
                synopsis: editingBook.synopsis,
              } : undefined}
            />
            {editingBook && (
              <BookMediaManager
                bookId={editingBook.id}
                coverImageUrl={editingBook.coverImageUrl}
                hasEbook={editingBook.hasEbook}
                ebookMimeType={editingBook.ebookMimeType}
                ebookOriginalName={editingBook.ebookOriginalName}
                ebookSize={editingBook.ebookSize}
              />
            )}
          </div>

          <div className="panel">
            <div className="section-title-row">
              <div><h3>Livros cadastrados</h3><p className="muted">Veja os publicados e rascunhos; edite os metadados ou altere a publicação.</p></div>
              <a className="btn sm ghost" href="/admin#livros">+ Novo livro</a>
            </div>
            {books.length === 0 ? (
              <p className="muted">Nenhum livro cadastrado. Cadastre um livro acima; se necessário, crie o autor sem sair do formulário.</p>
            ) : (
              <div className="tbl">
                <table>
                  <thead><tr><th>Título</th><th>Autor</th><th>Categoria</th><th>Preço</th><th>Status</th><th>Ações</th></tr></thead>
                  <tbody>{books.map((book) => (
                    <tr key={book.id}>
                      <td>{book.title}</td><td>{book.author}</td><td>{book.category}</td><td>{formatBRL(book.price)}</td>
                      <td><span className={book.published ? "pill" : "pill w"}>{book.published ? "Publicado" : "Rascunho"}</span></td>
                      <td><div className="row-actions">
                        <Link className="btn sm ghost" href={`/admin?editar=${encodeURIComponent(book.id)}#livros`}>Editar</Link>
                        <form action={setBookPublishedAction}>
                          <input type="hidden" name="id" value={book.id} />
                          <input type="hidden" name="publish" value={String(!book.published)} />
                          <button className="btn sm" type="submit">{book.published ? "Retirar" : "Publicar"}</button>
                        </form>
                      </div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="admin-section" id="autores" aria-labelledby="authors-heading">
          <div className="admin-section-heading">
            <p className="tag">Pessoas e perfis</p>
            <h2 id="authors-heading">Autores</h2>
          </div>
          <div className="panel">
            <h3>{editingAuthor ? `Editar autor: ${editingAuthor.name}` : "Cadastrar autor"}</h3>
            {typeof editarAutor === "string" && !editingAuthor && <p className="error" role="alert">Autor não encontrado. Você pode cadastrar um novo abaixo.</p>}
            <AuthorAdminForm
              key={editingAuthor?.id ?? "novo-autor"}
              initial={editingAuthor ? {
                id: editingAuthor.id,
                slug: editingAuthor.slug,
                name: editingAuthor.name,
                bio: editingAuthor.bio,
                color: editingAuthor.color,
                photoUrl: editingAuthor.photoUrl,
              } : undefined}
            />
          </div>

          <div className="panel">
            <div className="section-title-row">
              <div><h3>Autores cadastrados</h3><p className="muted">Pesquise por nome; perfis públicos aparecem quando o autor tem ao menos um livro publicado.</p></div>
              <a className="btn sm ghost" href="/admin#autores">+ Novo autor</a>
            </div>
            <form className="admin-inline-search" action="/admin#autores" method="get" role="search">
              <label htmlFor="q-autor">Pesquisar autor cadastrado</label>
              <div>
                <input id="q-autor" name="qAutor" type="search" maxLength={100} defaultValue={authorSearch} placeholder="Nome do autor" />
                <button className="btn sm" type="submit">Pesquisar</button>
                {authorSearch && <Link className="btn sm ghost" href="/admin#autores">Limpar</Link>}
              </div>
            </form>
            {authorsForAdmin.length === 0 ? (
              <p className="muted">Nenhum autor cadastrado. Crie um autor aqui ou diretamente durante o cadastro de um livro.</p>
            ) : visibleAuthors.length === 0 ? (
              <p className="muted" role="status">Nenhum autor corresponde a “{authorSearch}”.</p>
            ) : (
              <div className="tbl">
                <table>
                  <thead><tr><th>Autor</th><th>Livros publicados</th><th>Livros cadastrados</th><th>Perfil</th><th>Ações</th></tr></thead>
                  <tbody>{visibleAuthors.map((author) => (
                    <tr key={author.id}>
                      <td><div className="admin-author-cell">
                        {author.photoUrl
                          ? <Image src={author.photoUrl} width={36} height={36} alt="" className="admin-author-photo" unoptimized />
                          : <span className="admin-author-color" style={{ background: author.color }} />}
                        {author.name}
                      </div></td>
                      <td>{author.publishedBookCount}</td><td>{author.totalBookCount}</td>
                      <td>{author.publishedBookCount > 0 ? <Link href={`/autor/${encodeURIComponent(author.slug)}`}>Ver perfil</Link> : <span className="muted">Sem livros publicados</span>}</td>
                      <td><Link className="btn sm ghost" href={`/admin?editarAutor=${encodeURIComponent(author.id)}#autores`}>Editar</Link></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
