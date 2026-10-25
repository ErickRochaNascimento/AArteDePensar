// Destino de redirecionamento após o login. Só aceita caminhos internos do
// próprio site (evita "open redirect" para outros domínios).

const SAFE_PATH = /^\/(?!\/)[A-Za-z0-9\-._~%/?=&#]*$/;

export function safeNext(value: unknown, fallback = "/meus-livros"): string {
  if (typeof value !== "string") return fallback;
  if (value.length === 0 || value.length > 200) return fallback;
  if (!SAFE_PATH.test(value)) return fallback;
  if (value === "/entrar" || value.startsWith("/entrar?") || value.startsWith("/entrar/")) {
    return fallback;
  }
  return value;
}
