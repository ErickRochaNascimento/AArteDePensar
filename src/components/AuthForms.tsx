"use client";

import { useActionState } from "react";
import { loginAction, registerAction } from "@/app/actions/auth";
import type { AuthActionState } from "@/lib/auth-types";

const INITIAL_STATE: AuthActionState = {};

export function AuthForms({ next }: { next?: string }) {
  const [loginState, loginFormAction, loginPending] = useActionState(
    loginAction,
    INITIAL_STATE,
  );
  const [registerState, registerFormAction, registerPending] = useActionState(
    registerAction,
    INITIAL_STATE,
  );

  return (
    <div className="auth">
      <form action={loginFormAction}>
        {next && <input type="hidden" name="next" value={next} />}
        <h2 style={{ fontSize: 24 }}>Entrar</h2>
        <label>
          E-mail
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={191}
            placeholder="voce@email.com"
            required
          />
        </label>
        <label>
          Senha
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            required
          />
        </label>
        <small className="muted">
          A recuperação de senha ainda não está disponível.
        </small>
        {loginState.error && (
          <p className="error" role="alert" aria-live="polite">
            {loginState.error}
          </p>
        )}
        <button className="btn" type="submit" disabled={loginPending}>
          {loginPending ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <form action={registerFormAction}>
        {next && <input type="hidden" name="next" value={next} />}
        <h2 style={{ fontSize: 24 }}>Criar conta</h2>
        <label>
          Nome completo
          <input
            name="name"
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={120}
            placeholder="Seu nome"
            required
          />
        </label>
        <label>
          E-mail
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={191}
            placeholder="voce@email.com"
            required
          />
        </label>
        <label>
          Senha
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            placeholder="Mínimo de 8 caracteres"
            required
          />
        </label>
        <small className="muted">Sua senha será armazenada como hash protegido.</small>
        {registerState.error && (
          <p className="error" role="alert" aria-live="polite">
            {registerState.error}
          </p>
        )}
        <button className="btn hi" type="submit" disabled={registerPending}>
          {registerPending ? "Criando conta…" : "Criar conta"}
        </button>
      </form>
    </div>
  );
}
