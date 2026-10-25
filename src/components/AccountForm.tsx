"use client";

import { useActionState, useState } from "react";
import { updateAccountAction } from "@/app/actions/account";
import type { AccountFormState } from "@/lib/account-types";

type Props = {
  initialName: string;
  initialEmail: string;
};

export function AccountForm({ initialName, initialEmail }: Props) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const initialState: AccountFormState = {
    values: { name: initialName, email: initialEmail },
  };
  const [state, formAction, pending] = useActionState(updateAccountAction, initialState);

  return (
    <form className="panel account-form" action={formAction}>
      <label htmlFor="account-name">
        Nome
        <input
          id="account-name"
          name="name"
          type="text"
          autoComplete="name"
          minLength={2}
          maxLength={120}
          value={name}
          aria-invalid={Boolean(state.fieldErrors?.name)}
          aria-describedby={state.fieldErrors?.name ? "account-name-error" : undefined}
          onChange={(event) => setName(event.target.value)}
          required
        />
        {state.fieldErrors?.name && (
          <small className="error" id="account-name-error">
            {state.fieldErrors.name}
          </small>
        )}
      </label>

      <label htmlFor="account-email">
        E-mail
        <input
          id="account-email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={191}
          value={email}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "account-email-error" : undefined}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        {state.fieldErrors?.email && (
          <small className="error" id="account-email-error">
            {state.fieldErrors.email}
          </small>
        )}
      </label>

      <label htmlFor="account-current-password">
        Senha atual
        <input
          id="account-current-password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          aria-describedby="account-password-hint"
        />
      </label>
      <small className="muted" id="account-password-hint">
        Só é exigida quando você altera o e-mail.
      </small>

      {state.error && (
        <p className="error" role="alert" aria-live="polite">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="ok" role="status" aria-live="polite">
          {state.success}
        </p>
      )}

      <div className="form-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Salvar dados"}
        </button>
      </div>
    </form>
  );
}
