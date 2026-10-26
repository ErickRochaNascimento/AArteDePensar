"use client";

import { reviewCatalogChangeAction } from "@/app/actions/catalog-changes";
import type { PendingCatalogChange } from "@/lib/catalog-changes";
import { formatBRL } from "@/lib/data";

type AuthorOption = { id: string; name: string };

type Props = {
  changes: PendingCatalogChange[];
  entityType: "BOOK" | "AUTHOR";
  authors?: AuthorOption[];
};

function submittedDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CatalogApprovalPanel({ changes, entityType, authors = [] }: Props) {
  const title = entityType === "BOOK" ? "Edições de livros aguardando confirmação" : "Edições de autores aguardando confirmação";
  if (changes.length === 0) {
    return <p className="muted">Não há alterações pendentes para revisar.</p>;
  }

  return (
    <div className="approval-list" aria-label={title}>
      {changes.map((change) => {
        const payload = change.payload;
        const authorName = authors.find((author) => author.id === payload.authorId)?.name ?? "Autor não encontrado";
        const displayTitle = entityType === "BOOK" ? payload.title : payload.name;
        return (
          <article className="approval-request" key={change.id}>
            <div className="section-title-row">
              <div>
                <p className="tag">Proposta de {entityType === "BOOK" ? "livro" : "autor"}</p>
                <h4>{displayTitle || "Registro sem título"}</h4>
              </div>
              <span className="pill w">Aguardando Admin</span>
            </div>
            {entityType === "BOOK" ? (
              <div className="approval-details">
                <p><strong>Autor:</strong> {authorName}</p>
                <p><strong>Categoria:</strong> {payload.category || "—"} · <strong>Ano:</strong> {payload.year ?? "—"} · <strong>Páginas:</strong> {payload.pages ?? "—"}</p>
                <p><strong>Preço:</strong> {formatBRL(Number(payload.price ?? 0))}</p>
                <p><strong>Sinopse proposta:</strong> {payload.synopsis || "—"}</p>
              </div>
            ) : (
              <div className="approval-details">
                <p><strong>Biografia proposta:</strong> {payload.bio || "—"}</p>
                <p><strong>Cor de perfil:</strong> <span className="approval-color" style={{ backgroundColor: payload.color }} /> {payload.color || "—"}</p>
              </div>
            )}
            <p className="muted">Enviado por {change.submittedBy.name} ({change.submittedBy.email}) em {submittedDate(change.submittedAt)}.</p>
            <div className="row-actions approval-actions">
              <form action={reviewCatalogChangeAction}>
                <input type="hidden" name="id" value={change.id} />
                <input type="hidden" name="decision" value="approve" />
                <button className="btn sm" type="submit">Confirmar edição</button>
              </form>
              <form action={reviewCatalogChangeAction}>
                <input type="hidden" name="id" value={change.id} />
                <input type="hidden" name="decision" value="reject" />
                <button className="btn sm ghost" type="submit">Rejeitar</button>
              </form>
            </div>
          </article>
        );
      })}
    </div>
  );
}
