"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

// Formulários de login e cadastro (somente front-end).
// Entrega 1: as chamadas reais (API + senha com hash argon2/bcrypt) substituem o router.push.

export function AuthForms() {
  const router = useRouter();
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");

  function onLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!email || !password) {
      setLoginError("Informe e-mail e senha.");
      return;
    }
    setLoginError("");
    router.push("/meus-livros");
  }

  function onRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!name || !email) {
      setRegisterError("Preencha nome e e-mail.");
      return;
    }
    if (password.length < 8) {
      setRegisterError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    setRegisterError("");
    router.push("/meus-livros");
  }

  return (
    <div className="auth">
      <form onSubmit={onLogin} noValidate>
        <h2 style={{ fontSize: 24 }}>Entrar</h2>
        <label>
          E-mail
          <input name="email" type="email" autoComplete="email" placeholder="voce@email.com" />
        </label>
        <label>
          Senha
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha"
          />
        </label>
        <a href="#" style={{ fontSize: 13.5, color: "var(--accent)" }}>
          Esqueci minha senha
        </a>
        {loginError && <p className="error" role="alert">{loginError}</p>}
        <button className="btn" type="submit">
          Entrar
        </button>
      </form>

      <form onSubmit={onRegister} noValidate>
        <h2 style={{ fontSize: 24 }}>Criar conta</h2>
        <label>
          Nome completo
          <input name="name" type="text" autoComplete="name" placeholder="Seu nome" />
        </label>
        <label>
          E-mail
          <input name="email" type="email" autoComplete="email" placeholder="voce@email.com" />
        </label>
        <label>
          Senha
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo de 8 caracteres"
          />
        </label>
        <small className="muted">Sua senha é armazenada de forma protegida.</small>
        {registerError && <p className="error" role="alert">{registerError}</p>}
        <button className="btn hi" type="submit">
          Criar conta
        </button>
      </form>
    </div>
  );
}
