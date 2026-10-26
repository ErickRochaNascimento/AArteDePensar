"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { deleteAuthorAction, setAuthorPublishedAction } from "@/app/actions/authors";
import { AuthorAdminForm } from "@/components/AuthorAdminForm";
import { CatalogApprovalPanel } from "@/components/CatalogApprovalPanel";
import type { PendingCatalogChange } from "@/lib/catalog-changes";

type AdminAuthor = {
  id: string;
  name: string;
  slug: string;
  bio: string;
  color: string;
  photoUrl: string | null;
  published: boolean;
  publishedBookCount: number;
  totalBookCount: number;
};

type Props = {
  authors: AdminAuthor[];
  totalAuthors: number;
  searchTerm: string;
  isAdmin: boolean;
  pendingChanges: PendingCatalogChange[];
};

export function AdminAuthorsPanel({ authors, totalAuthors, searchTerm, isAdmin, pendingChanges }: Props) {
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null);
  const editingAuthor = authors.find((author) => author.id === editingAuthorId) ?? null;
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingAuthorId) editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [editingAuthorId]);

  return (
    <>
      <div className="panel admin-editor-panel" ref={editorRef}>
        <div className="section-title-row">
          <h3>{editingAuthor ? `Editar autor: ${editingAuthor.name}` : "Cadastrar autor"}</h3>
          {editingAuthor && <span className="pill">Edição temporária</span>}
        </div>
        {!isAdmin && <p className="muted">Novos autores ficam como rascunho. Edições de autores existentes aguardam confirmação de um administrador.</p>}
        <AuthorAdminForm
          key={editingAuthor?.id ?? "novo-autor"}
          initial={editingAuthor ? {
            id: editingAuthor.id,
            slug: editingAuthor.slug,
            name: editingAuthor.name,
            bio: editingAuthor.bio,
            color: editingAuthor.color,
            photoUrl: editingAuthor.photoUrl,
            published: editingAuthor.published,
          } : undefined}
          isAdmin={isAdmin}
          canManageMedia={isAdmin || !editingAuthor?.published}
          onCancel={editingAuthor ? () => setEditingAuthorId(null) : undefined}
        />
      </div>

      {isAdmin && (
        <div className="panel">
          <div className="section-title-row">
            <div>
              <h3>Revisões de autores</h3>
              <p className="muted">As alterações enviadas por Funcionários só aparecem no perfil público depois de confirmadas.</p>
            </div>
            <span className="pill w">{pendingChanges.length} pendentes</span>
          </div>
          <CatalogApprovalPanel changes={pendingChanges} entityType="AUTHOR" />
        </div>
      )}

      <div className="panel">
        <div className="section-title-row">
          <div>
            <h3>Autores cadastrados</h3>
            <p className="muted">Pesquise por nome e confira publicação e livros associados.</p>
          </div>
          <button
            className="btn sm ghost"
            type="button"
            onClick={() => {
              setEditingAuthorId(null);
              editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            + Novo autor
          </button>
        </div>
        <form className="admin-inline-search" action="/admin#autores" method="get" role="search">
          <label htmlFor="q-autor">Pesquisar autor cadastrado</label>
          <div>
            <input id="q-autor" name="qAutor" type="search" maxLength={100} defaultValue={searchTerm} placeholder="Nome do autor" />
            <button className="btn sm" type="submit">Pesquisar</button>
            {searchTerm && <Link className="btn sm ghost" href="/admin#autores">Limpar</Link>}
          </div>
        </form>
        {totalAuthors === 0 ? (
          <p className="muted">Nenhum autor cadastrado. Crie um autor aqui ou diretamente durante o cadastro de um livro.</p>
        ) : authors.length === 0 ? (
          <p className="muted" role="status">Nenhum autor corresponde a “{searchTerm}”.</p>
        ) : (
          <div className="tbl">
            <table>
              <thead><tr><th>Autor</th><th>Status</th><th>Livros publicados</th><th>Livros cadastrados</th><th>Perfil</th><th>Ações</th></tr></thead>
              <tbody>{authors.map((author) => (
                <tr key={author.id}>
                  <td><div className="admin-author-cell">
                    {author.photoUrl
                      ? <Image src={author.photoUrl} width={36} height={36} alt="" className="admin-author-photo" unoptimized />
                      : <span className="admin-author-color" style={{ background: author.color }} />}
                    {author.name}
                  </div></td>
                  <td><span className={author.published ? "pill" : "pill w"}>{author.published ? "Publicado" : "Rascunho"}</span></td>
                  <td>{author.publishedBookCount}</td><td>{author.totalBookCount}</td>
                  <td>{author.published && author.publishedBookCount > 0
                    ? <Link href={`/autor/${encodeURIComponent(author.slug)}`}>Ver perfil</Link>
                    : <span className="muted">Sem perfil público</span>}</td>
                  <td><div className="row-actions">
                    <button className="btn sm ghost" type="button" onClick={() => setEditingAuthorId(author.id)}>Editar</button>
                    {isAdmin ? (
                      <>
                        <form action={setAuthorPublishedAction}>
                          <input type="hidden" name="id" value={author.id} />
                          <input type="hidden" name="publish" value={String(!author.published)} />
                          <button
                            className="btn sm"
                            type="submit"
                            disabled={author.published && author.publishedBookCount > 0}
                            title={author.published && author.publishedBookCount > 0 ? "Retire primeiro os livros publicados deste autor." : undefined}
                          >
                            {author.published ? "Retirar" : "Publicar"}
                          </button>
                        </form>
                        <form
                          action={deleteAuthorAction}
                          onSubmit={(event) => {
                            if (!window.confirm(`Excluir o autor “${author.name}”? Essa ação não pode ser desfeita.`)) event.preventDefault();
                          }}
                        >
                          <input type="hidden" name="id" value={author.id} />
                          <button
                            className="btn sm ghost danger"
                            type="submit"
                            disabled={author.totalBookCount > 0}
                            title={author.totalBookCount > 0 ? "Autor associado a livros não pode ser excluído." : undefined}
                          >Excluir</button>
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
