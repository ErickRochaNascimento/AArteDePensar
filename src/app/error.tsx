"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <h1 style={{ fontSize: 26 }}>Não foi possível carregar esta página</h1>
      <p className="muted" style={{ margin: 0 }}>
        Tivemos um problema ao consultar a livraria. Tente novamente em instantes.
      </p>
      <button type="button" className="btn" onClick={reset}>
        Tentar de novo
      </button>
    </div>
  );
}
