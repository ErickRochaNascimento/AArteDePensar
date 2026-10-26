"use client";

import { useEffect, useRef, useState } from "react";
import { deleteBookAction, setBookPublishedAction } from "@/app/actions/catalog";
import { BookAdminForm } from "@/components/BookAdminForm";
import { CatalogApprovalPanel } from "@/components/CatalogApprovalPanel";
import { formatBRL } from "@/lib/data";
import type { PendingCatalogChange } from "@/lib/catalog-changes";

type AuthorOption = { id: string; name: string };
type AdminBookRow = {
  id: string;
  slug: string;
  title: string;
  author: string;
  authorId: string;
  year: number;
  category: string;
  pages: number;
  price: number;
  synopsis: string;
  published: boolean;
  coverImageUrl?: string | null;
  hasEbook: boolean;
  ebookMimeType: string | null;
  ebookOriginalName: string | null;
  ebookSize: number | null;
};

type Props = {
  books: AdminBookRow[];
  authors: AuthorOption[];
  categories: string[];
  isAdmin: boolean;
  publicationError: boolean;
  pendingChanges: PendingCatalogChange[];
};

export function AdminBooksPanel({ books, authors, categories, isAdmin, publicationError, pendingChanges }: Props) {
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const editingBook = books.find((book) => book.id === editingBookId) ?? null;
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingBookId) editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [editingBookId]);

  const initial = editingBook ? {
    id: editingBook.id,
    slug: editingBook.slug,
    published: editingBook.published,
    title: editingBook.title,
    authorId: editingBook.authorId,
    year: String(editingBook.year),
    category: editingBook.category,
    pages: String(editingBook.pages),
    price: editingBook.price.toFixed(2).replace(".", ","),
    synopsis: editingBook.synopsis,
    coverImageUrl: editingBook.coverImageUrl,
    hasEbook: editingBook.hasEbook,
    ebookMimeType: editingBook.ebookMimeType,
    ebookOriginalName: editingBook.ebookOriginalName,
    ebookSize: editingBook.ebookSize,
  } : undefined;

  return (
    <>
      <div className="panel admin-editor-panel" ref={editorRef}>
        <div className="section-title-row">
          <h3>{editingBook ? `Editar livro: ${editingBook.title}` : "Cadastrar livro"}</h3>
          {editingBook && <span className="pill">Edição temporária</span>}
        </div>
        {publicationError && <p className="error" role="alert">Não foi possível alterar a publicação do livro. Confira se o autor já está publicado.</p>}
        {!isAdmin && <p className="muted">Novos livros ficam como rascunho. Edições de livros existentes aguardam confirmação de um administrador.</p>}
        <BookAdminForm
          key={editingBook?.id ?? "novo-livro"}
          authors={authors}
          categories={categories}
          initial={initial}
          isAdmin={isAdmin}
          onCancel={editingBook ? () => setEditingBookId(null) : undefined}
        />
      </div>

      {isAdmin && (
        <div className="panel">
          <div className="section-title-row">
            <div>
              <h3>Revisões de livros</h3>
              <p className="muted">As alterações enviadas por Funcionários só aparecem no catálogo depois de confirmadas.</p>
            </div>
            <span className="pill w">{pendingChanges.length} pendentes</span>
          </div>
          <CatalogApprovalPanel changes={pendingChanges} entityType="BOOK" authors={authors} />
        </div>
      )}

      <div className="panel">
        <div className="section-title-row">
          <div>
            <h3>Livros cadastrados</h3>
            <p className="muted">Veja os publicados e rascunhos; abra um registro para editar os metadados e arquivos.</p>
          </div>
          <button
            className="btn sm ghost"
            type="button"
            onClick={() => {
              setEditingBookId(null);
              editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            + Novo livro
          </button>
        </div>
        {books.length === 0 ? (
          <p className="muted">Nenhum livro cadastrado. Cadastre um rascunho acima; se necessário, crie o autor sem sair do formulário.</p>
        ) : (
          <div className="tbl">
            <table>
              <thead><tr><th>Título</th><th>Autor</th><th>Categoria</th><th>Preço</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody>{books.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td><td>{book.author}</td><td>{book.category}</td><td>{formatBRL(book.price)}</td>
                  <td><span className={book.published ? "pill" : "pill w"}>{book.published ? "Publicado" : "Rascunho"}</span></td>
                  <td><div className="row-actions">
                    <button className="btn sm ghost" type="button" onClick={() => setEditingBookId(book.id)}>Editar</button>
                    {isAdmin ? (
                      <>
                        <form action={setBookPublishedAction}>
                          <input type="hidden" name="id" value={book.id} />
                          <input type="hidden" name="publish" value={String(!book.published)} />
                          <button className="btn sm" type="submit">{book.published ? "Retirar" : "Publicar"}</button>
                        </form>
                        <form
                          action={deleteBookAction}
                          onSubmit={(event) => {
                            if (!window.confirm(`Excluir “${book.title}”? Essa ação não pode ser desfeita.`)) event.preventDefault();
                          }}
                        >
                          <input type="hidden" name="id" value={book.id} />
                          <button className="btn sm ghost danger" type="submit">Excluir</button>
                        </form>
                      </>
                    ) : (
                      <span className="muted">Publicação e exclusão: ADMIN</span>
                    )}
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
