"use client";

import { useActionState, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { saveBookAction } from "@/app/actions/catalog";
import { AuthorAdminForm } from "@/components/AuthorAdminForm";
import { BookMediaManager } from "@/components/BookMediaManager";
import { normalizeText } from "@/lib/data";
import type { BookFormValues } from "@/lib/book-input";
import type { BookFormState } from "@/lib/book-form-types";

type AuthorOption = { id: string; name: string };
type ExistingBook = BookFormValues & {
  id: string;
  slug: string;
  published: boolean;
  coverImageUrl?: string | null;
  hasEbook?: boolean;
  ebookMimeType?: string | null;
  ebookOriginalName?: string | null;
  ebookSize?: number | null;
};
type Props = {
  authors: AuthorOption[];
  categories: string[];
  isAdmin: boolean;
  initial?: ExistingBook;
  onCancel?: () => void;
};

const INITIAL_STATE: BookFormState = {};

export function BookAdminForm({ authors: availableAuthors, categories, isAdmin, initial, onCancel }: Props) {
  const initialAuthor = availableAuthors.find((author) => author.id === initial?.authorId);
  const [state, formAction, pending] = useActionState(saveBookAction, INITIAL_STATE);
  const [authors, setAuthors] = useState(availableAuthors);
  const [selectedAuthor, setSelectedAuthor] = useState(initial?.authorId ?? "");
  const [authorSearch, setAuthorSearch] = useState(initialAuthor?.name ?? "");
  const [authorMenuOpen, setAuthorMenuOpen] = useState(false);
  const [activeAuthorIndex, setActiveAuthorIndex] = useState(0);
  const [showNewAuthor, setShowNewAuthor] = useState(availableAuthors.length === 0);
  const [categoryValue, setCategoryValue] = useState(initial?.category ?? "");
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const quickAuthorPanelRef = useRef<HTMLDivElement>(null);
  const bookFormRef = useRef<HTMLFormElement>(null);
  const shouldScrollToAuthorRef = useRef(false);
  const shouldScrollBackToBookRef = useRef(false);

  const value = (key: keyof BookFormValues) => state.values?.[key] ?? initial?.[key] ?? "";
  const fieldError = (key: keyof BookFormValues) => state.fieldErrors?.[key];
  const filteredAuthors = authors.filter((author) =>
    normalizeText(author.name).includes(normalizeText(authorSearch.trim())),
  );
  const activeAuthor = filteredAuthors[activeAuthorIndex];
  const normalizedCategory = normalizeText(categoryValue.trim());
  const filteredCategories = categories.filter((category) =>
    !normalizedCategory || normalizeText(category).includes(normalizedCategory),
  );
  const exactCategoryExists = categories.some((category) => normalizeText(category) === normalizedCategory);
  const canUseCustomCategory = categoryValue.trim().length > 0 && !exactCategoryExists;
  const categoryOptionCount = filteredCategories.length + (canUseCustomCategory ? 1 : 0);
  const persistedBook = state.savedBook ?? (initial ? {
    id: initial.id,
    slug: initial.slug,
    title: initial.title,
    coverImageUrl: initial.coverImageUrl ?? null,
    hasEbook: initial.hasEbook ?? false,
    ebookMimeType: initial.ebookMimeType ?? null,
    ebookOriginalName: initial.ebookOriginalName ?? null,
    ebookSize: initial.ebookSize ?? null,
  } : null);

  useEffect(() => {
    if (showNewAuthor && shouldScrollToAuthorRef.current) {
      window.requestAnimationFrame(() => {
        quickAuthorPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      shouldScrollToAuthorRef.current = false;
    }
    if (!showNewAuthor && shouldScrollBackToBookRef.current) {
      window.requestAnimationFrame(() => {
        bookFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      shouldScrollBackToBookRef.current = false;
    }
  }, [showNewAuthor]);

  function selectAuthor(author: AuthorOption) {
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

  function selectCategory(category: string) {
    setCategoryValue(category);
    setCategoryMenuOpen(false);
  }

  function handleCategoryKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCategoryMenuOpen(true);
      setActiveCategoryIndex((current) => Math.min(current + 1, Math.max(categoryOptionCount - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCategoryMenuOpen(true);
      setActiveCategoryIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && categoryMenuOpen && categoryOptionCount > 0) {
      event.preventDefault();
      if (activeCategoryIndex < filteredCategories.length) {
        selectCategory(filteredCategories[activeCategoryIndex]);
      } else if (canUseCustomCategory) {
        selectCategory(categoryValue.trim());
      }
    } else if (event.key === "Escape") {
      setCategoryMenuOpen(false);
    }
  }

  function toggleQuickAuthor() {
    if (showNewAuthor) {
      setShowNewAuthor(false);
      return;
    }
    shouldScrollToAuthorRef.current = true;
    setShowNewAuthor(true);
  }

  function useCreatedAuthor(author: AuthorOption) {
    setAuthors((current) => current.some((item) => item.id === author.id)
      ? current
      : [...current, author].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")));
    selectAuthor(author);
    shouldScrollBackToBookRef.current = true;
    setShowNewAuthor(false);
  }

  return (
    <>
      <form className="form" action={formAction} noValidate ref={bookFormRef}>
        {persistedBook && <input type="hidden" name="id" value={persistedBook.id} />}
        <input type="hidden" name="authorId" value={selectedAuthor} />
        <input type="hidden" name="category" value={categoryValue} />

        <label className="full">
          Título
          <input name="title" type="text" maxLength={160} defaultValue={value("title")} placeholder="Ex.: O Farol de Santo Amaro" aria-invalid={Boolean(fieldError("title"))} required />
          {fieldError("title") && <span className="error">{fieldError("title")}</span>}
        </label>

        <div className="full author-picker-row">
          <div className="author-combobox-field">
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
                <div className="author-combobox-empty" role="status">Nenhum autor encontrado. Use o botão ao lado para cadastrá-lo.</div>
              )}
            </div>
          </div>
          {!initial && (
            <button
              className="btn sm ghost author-quick-toggle"
              type="button"
              aria-expanded={showNewAuthor}
              aria-controls="quick-author-panel"
              onClick={toggleQuickAuthor}
            >
              {showNewAuthor ? "Fechar cadastro rápido" : "Cadastrar autor não listado"}
            </button>
          )}
        </div>
        {fieldError("authorId") && <span className="error full">{fieldError("authorId")}</span>}

        <div className="full author-combobox-field">
          <label htmlFor="book-category-combobox">Categoria</label>
          <div className="author-combobox">
            <input
              id="book-category-combobox"
              type="search"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={categoryMenuOpen}
              aria-controls="book-category-options"
              aria-activedescendant={categoryMenuOpen && categoryOptionCount > 0
                ? activeCategoryIndex < filteredCategories.length
                  ? `book-category-option-${activeCategoryIndex}`
                  : "book-category-custom"
                : undefined}
              aria-invalid={Boolean(fieldError("category"))}
              aria-required="true"
              autoComplete="off"
              maxLength={60}
              value={categoryValue}
              placeholder="Pesquise ou digite uma categoria"
              onFocus={() => setCategoryMenuOpen(true)}
              onBlur={() => setCategoryMenuOpen(false)}
              onChange={(event) => {
                setCategoryValue(event.target.value);
                setActiveCategoryIndex(0);
                setCategoryMenuOpen(true);
              }}
              onKeyDown={handleCategoryKeyDown}
            />
            {categoryMenuOpen && categoryOptionCount > 0 && (
              <div className="author-combobox-options" id="book-category-options" role="listbox" aria-label="Categorias disponíveis">
                {filteredCategories.map((category, index) => (
                  <button
                    className="author-combobox-option"
                    id={`book-category-option-${index}`}
                    key={category}
                    type="button"
                    role="option"
                    aria-selected={normalizeText(category) === normalizedCategory}
                    data-active={index === activeCategoryIndex}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectCategory(category)}
                  >
                    {category}
                  </button>
                ))}
                {canUseCustomCategory && (
                  <button
                    className="author-combobox-option"
                    id="book-category-custom"
                    type="button"
                    role="option"
                    aria-selected={false}
                    data-active={activeCategoryIndex === filteredCategories.length}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectCategory(categoryValue.trim())}
                  >
                    Usar categoria “{categoryValue.trim()}”
                  </button>
                )}
              </div>
            )}
            {categoryMenuOpen && categoryOptionCount === 0 && (
              <div className="author-combobox-empty" role="status">Digite uma categoria para cadastrá-la neste livro.</div>
            )}
          </div>
          {fieldError("category") && <span className="error">{fieldError("category")}</span>}
        </div>

        <label>
          Ano
          <input name="year" type="number" min={1000} max={new Date().getFullYear() + 1} step={1} defaultValue={value("year")} placeholder="2025" aria-invalid={Boolean(fieldError("year"))} required />
          {fieldError("year") && <span className="error">{fieldError("year")}</span>}
        </label>
        <label>
          Páginas
          <input name="pages" type="number" min={1} max={20000} step={1} defaultValue={value("pages")} placeholder="240" aria-invalid={Boolean(fieldError("pages"))} required />
          {fieldError("pages") && <span className="error">{fieldError("pages")}</span>}
        </label>
        <label>
          Preço (R$)
          <input name="price" type="text" inputMode="decimal" maxLength={20} defaultValue={value("price")} placeholder="24,90" aria-invalid={Boolean(fieldError("price"))} required />
          {fieldError("price") && <span className="error">{fieldError("price")}</span>}
        </label>
        <label className="full">
          Sinopse
          <textarea name="synopsis" rows={5} minLength={10} maxLength={4000} defaultValue={value("synopsis")} placeholder="Apresentação do livro" aria-invalid={Boolean(fieldError("synopsis"))} required />
          {fieldError("synopsis") && <span className="error">{fieldError("synopsis")}</span>}
        </label>
        {state.error && <p className="error full" role="alert">{state.error}</p>}
        {state.success && <p className="ok full" role="status">{state.success}</p>}
        <div className="full form-actions">
          <button className="btn sm" type="submit" disabled={pending}>
            {pending
              ? "Salvando…"
              : initial || persistedBook
                ? isAdmin ? "Confirmar edição" : "Enviar edição para aprovação"
                : "Cadastrar livro"}
          </button>
          {onCancel && <button className="btn sm ghost" type="button" onClick={onCancel}>Cancelar edição</button>}
        </div>
        {initial && <small className="muted full">Endereço público: /livro/{initial.slug} (preservado para não quebrar links).</small>}
      </form>

      {showNewAuthor && !initial && (
        <div className="quick-author-panel" id="quick-author-panel" ref={quickAuthorPanelRef}>
          <div className="quick-author-heading">
            <div>
              <h3>Cadastrar autor para este livro</h3>
              <p className="muted">Salve os dados e, se quiser, envie a foto antes de selecionar o autor no campo acima.</p>
            </div>
          </div>
          <AuthorAdminForm compact isAdmin={isAdmin} canManageMedia onCreated={useCreatedAuthor} />
        </div>
      )}

      <BookMediaManager
        bookId={persistedBook?.id ?? null}
        coverImageUrl={persistedBook?.coverImageUrl}
        hasEbook={persistedBook?.hasEbook ?? false}
        ebookMimeType={persistedBook?.ebookMimeType}
        ebookOriginalName={persistedBook?.ebookOriginalName}
        ebookSize={persistedBook?.ebookSize}
        canManageMedia={isAdmin || !initial?.published}
      />
    </>
  );
}
