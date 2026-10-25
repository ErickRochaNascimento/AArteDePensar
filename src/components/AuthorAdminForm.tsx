"use client";

import { useActionState } from "react";
import { saveAuthorAction } from "@/app/actions/authors";
import type { AuthorFormState } from "@/lib/author-form-types";

type Author = { id: string; name: string; slug: string; bio: string; color: string };
type Props = {
  initial?: Author;
  compact?: boolean;
  onCreated?: (author: Author) => void;
  onCancel?: () => void;
};

const EMPTY_STATE: AuthorFormState = {};

export function AuthorAdminForm({ initial, compact = false, onCreated, onCancel }: Props) {
  const [state, formAction, pending] = useActionState(saveAuthorAction, EMPTY_STATE);
  const author = state.savedAuthor;

  return (
    <form className={compact ? "form author-form author-form-compact" : "form author-form"} action={formAction}>
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <label className="full">
        Nome do autor
        <input
          name="name"
          type="text"
          minLength={2}
          maxLength={120}
          defaultValue={state.values?.name ?? initial?.name ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.name)}
          required
        />
        {state.fieldErrors?.name && <span className="error">{state.fieldErrors.name}</span>}
      </label>
      <label className="full">
        Biografia
        <textarea
          name="bio"
          rows={compact ? 3 : 5}
          minLength={10}
          maxLength={4000}
          defaultValue={state.values?.bio ?? initial?.bio ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.bio)}
          placeholder="Apresentação do autor exibida no perfil público"
          required
        />
        {state.fieldErrors?.bio && <span className="error">{state.fieldErrors.bio}</span>}
      </label>
      <label className="author-color-label">
        Cor do perfil
        <input
          name="color"
          type="color"
          defaultValue={state.values?.color ?? initial?.color ?? "#1F4E5F"}
          aria-invalid={Boolean(state.fieldErrors?.color)}
        />
        {state.fieldErrors?.color && <span className="error">{state.fieldErrors.color}</span>}
      </label>
      {state.error && <p className="error full" role="alert">{state.error}</p>}
      {state.success && <p className="ok full" role="status">{state.success}</p>}
      <div className="full form-actions">
        <button className="btn sm" type="submit" disabled={pending}>
          {pending ? "Salvando…" : initial ? "Salvar autor" : "Cadastrar autor"}
        </button>
        {onCancel && <button className="btn sm ghost" type="button" onClick={onCancel}>Cancelar</button>}
        {author && onCreated && (
          <button className="btn sm ghost" type="button" onClick={() => onCreated(author)}>
            Usar este autor no livro
          </button>
        )}
      </div>
      {!compact && initial && <small className="muted full">Endereço público: /autor/{initial.slug} (preservado para não quebrar links).</small>}
    </form>
  );
}
