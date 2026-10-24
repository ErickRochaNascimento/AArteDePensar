import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", paddingBlock: 40 }}>
      <h1 style={{ fontSize: 32 }}>Página não encontrada</h1>
      <p className="muted">O endereço que você tentou abrir não existe ou foi removido.</p>
      <Link className="btn" href="/">
        Voltar para o início
      </Link>
    </div>
  );
}
