import Link from "next/link";

export function ReaderClient({ title }: { title: string }) {
  return (
    <div className="reader-empty">
      <section className="panel">
        <p className="tag">Livro na sua biblioteca</p>
        <h1 style={{ fontSize: 28 }}>{title}</h1>
        <p>
          Seu acesso a este livro foi confirmado. O arquivo digital ainda não foi cadastrado no
          sistema, então a leitura online e o download não estão disponíveis.
        </p>
        <p className="muted">
          Quando o EPUB ou PDF real for anexado, esta página poderá carregá-lo sem expor o arquivo
          publicamente.
        </p>
        <div className="form-actions">
          <Link className="btn ghost" href="/meus-livros">
            Voltar à estante
          </Link>
        </div>
      </section>
    </div>
  );
}
