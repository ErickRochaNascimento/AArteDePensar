"use client";

import Link from "next/link";
import { useActionState, useState, type KeyboardEvent } from "react";
import { saveBookAction } from "@/app/actions/catalog";
import { AuthorAdminForm } from "@/components/AuthorAdminForm";
import type { BookFormState } from "@/lib/book-form-types";
import type { BookFormValues } from "@/lib/book-input";
import { normalizeText } from "@/lib/data";

type Props = {
  authors: { id: string; name: string }[];
  categories: string[];
  /** Valores iniciais ao editar; ausente = novo livro. */
  initial?: BookFormValues & { id: string; slug: string };
};

const INITIAL_STATE: BookFormState = {};

export function BookAdminForm({ authors: availableAuthors, categories, initial }: Props) {
  const initialAuthor = availableAuthors.find((author) => author.id === initial?.authorId);
  const [state, formAction, pending] = useActionState(saveBookAction, INITIAL_STATE);
  const [authors, setAuthors] = useState(availableAuthors);
  const [selectedAuthor, setSelectedAuthor] = useState(initial?.authorId ?? "");
  const [authorSearch, setAuthorSearch] = useState(initialAuthor?.name ?? "");
  const [authorMenuOpen, setAuthorMenuOpen] = useState(false);
  const [activeAuthorIndex, setActiveAuthorIndex] = useState(0);
  const [showNewAuthor, setShowNewAuthor] = useState(availableAuthors.length === 0);
  const value = (key: keyof BookFormValues) => state.values?.[key] ?? initial?.[key] ?? "";
  const fieldError = (key: keyof BookFormValues) => state.fieldErrors?.[key];
  const filteredAuthors = authors.filter((author) =>
    normalizeText(author.name).includes(normalizeText(authorSearch.trim())),
  );
  const activeAuthor = filteredAuthors[activeAuthorIndex];

  function selectAuthor(author: { id: string; name: string }) {
    setSelectedAuthor(author.id);
    setAuthorSearch(author.name);
    setAuthorMenuOpen(false);
  }

  function handleAuthorKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setAuthorMenuOpen(true);
      setActiveAuthorIndex((current) => Math.min(current + 1, Math.max(filteredAuthors.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setAuthorMenuOpen(true);
      setActiveAuthorIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && authorMenuOpen && activeAuthor) {
      event.preventDefault();
      selectAuthor(activeAuthor);
    } else if (event.key === "Escape") {
      setAuthorMenuOpen(false);
    }
  }

  function useCreatedAuthor(author: { id: string; name: string }) {
    setAuthors((current) => current.some((item) => item.id === author.id)
      ? current
      : [...current, author].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")));
    selectAuthor(author);
    setShowNewAuthor(false);
  }

  return (
    <>
      <form className="form" action={formAction} noValidate>
        {initial && <input type="hidden" name="id" value={initial.id} />}
        <input type="hidden" name="authorId" value={selectedAuthor} />

        <label className="full">
          Título
          <input name="title" type="text" maxLength={160} defaultValue={value("title")} placeholder="Ex.: O Farol de Santo Amaro" aria-invalid={Boolean(fieldError("title"))} required />
          {fieldError("title") && <span className="error">{fieldError("title")}</span>}
        </label>

        <div className="full author-combobox-field">
          <label htmlFor="book-author-combobox">Autor</label>
          <div className="author-combobox">
            <input
              id="book-author-combobox"
              type="search"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={authorMenuOpen}
              aria-controls="book-author-options"
              aria-activedescendant={authorMenuOpen && activeAuthor ? `book-author-option-${activeAuthor.id}` : undefined}
              aria-invalid={Boolean(fieldError("authorId"))}
              aria-required="true"
              autoComplete="off"
              value={authorSearch}
              placeholder="Pesquise e selecione um autor"
              onFocus={() => setAuthorMenuOpen(true)}
              onBlur={() => setAuthorMenuOpen(false)}
              onChange={(event) => {
                setAuthorSearch(event.target.value);
                setSelectedAuthor("");
                setActiveAuthorIndex(0);
                setAuthorMenuOpen(true);
              }}
              onKeyDown={handleAuthorKeyDown}
            />
            {authorMenuOpen && filteredAuthors.length > 0 && (
              <div className="author-combobox-options" id="book-author-options" role="listbox" aria-label="Autores disponíveis">
                {filteredAuthors.map((author, index) => (
                  <button
                    className="author-combobox-option"
                    id={`book-author-option-${author.id}`}
                    key={author.id}
                    type="button"
                    role="option"
                    aria-selected={selectedAuthor === author.id}
                    data-active={index === activeAuthorIndex}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectAuthor(author)}
                  >
                    {author.name}
                  </button>
                ))}
              </div>
            )}
            {authorMenuOpen && filteredAuthors.length === 0 && (
              <div className="author-combobox-empty" role="status">Nenhum autor encontrado. Você pode cadastrá-lo logo abaixo.</div>
            )}
          </div>
          {fieldError("authorId") && <span className="error" role="alert">{fieldError("authorId")}</span>}
        </div>

        {!initial && (
          <div className="quick-author-toggle">
            <button className="btn sm ghost" type="button" onClick={() => setShowNewAuthor((open) => !open)}>
              {showNewAuthor ? "Fechar cadastro de autor" : "+ Cadastrar autor não listado"}
            </button>
          </div>
        )}

        <label>
          Categoria
          <input name="category" type="text" list="categorias-existentes" maxLength={60} defaultValue={value("category")} placeholder="Ex.: Romance" aria-invalid={Boolean(fieldError("category"))} required />
          <datalist id="categorias-existentes">{categories.map((category) => <option key={category} value={category} />)}</datalist>
          {fieldError("category") && <span className="error">{fieldError("category")}</span>}
        </label>

        <label>
          Ano
          <input name="year" type="text" inputMode="numeric" maxLength={4} defaultValue={value("year")} placeholder="2024" aria-invalid={Boolean(fieldError("year"))} required />
          {fieldError("year") && <span className="error">{fieldError("year")}</span>}
        </label>

        <label>
          Páginas
          <input name="pages" type="text" inputMode="numeric" maxLength={5} defaultValue={value("pages")} placeholder="312" aria-invalid={Boolean(fieldError("pages"))} required />
          {fieldError("pages") && <span className="error">{fieldError("pages")}</span>}
        </label>

        <label>
          Preço (R$)
          <input name="price" type="text" inputMode="decimal" maxLength={12} defaultValue={value("price")} placeholder="24,90" aria-invalid={Boolean(fieldError("price"))} required />
          {fieldError("price") && <span className="error">{fieldError("price")}</span>}
        </label>

        <label className="full">
          Sinopse
          <textarea name="synopsis" rows={5} maxLength={4000} defaultValue={value("synopsis")} placeholder="Resumo que aparece na página do livro" aria-invalid={Boolean(fieldError("synopsis"))} required />
          {fieldError("synopsis") && <span className="error">{fieldError("synopsis")}</span>}
        </label>

        {state.error && <p className="error full" role="alert">{state.error}</p>}
        <div className="full form-actions">
          <button className="btn sm" type="submit" disabled={pending}>{pending ? "Salvando…" : initial ? "Salvar alterações" : "Cadastrar livro"}</button>
          {initial && <Link className="btn sm ghost" href="/admin#livros">Cancelar edição</Link>}
        </div>
        <small className="muted full">
          {initial
            ? `Endereço do livro: /livro/${initial.slug} (não muda ao editar o título).`
            : "Livros novos começam como rascunho. Depois de salvar, você poderá enviar a capa e o arquivo EPUB/PDF na edição."}
        </small>
      </form>

      {showNewAuthor && !initial && (
        <div className="quick-author-panel">
          <h3>Cadastrar autor para este livro</h3>
          <p className="muted">Depois de salvar, escolha “Usar este autor no livro” para selecioná-lo no formulário.</p>
          <AuthorAdminForm compact onCreated={useCreatedAuthor} onCancel={() => setShowNewAuthor(false)} />
        </div>
      )}
    </>
  );
}
