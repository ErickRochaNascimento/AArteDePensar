import Link from "next/link";

type Props = {
  title: string;
  slug: string;
  hasEbook: boolean;
  ebookMimeType: string | null;
  ebookOriginalName: string | null;
};

export function ReaderClient({ title, slug, hasEbook, ebookMimeType, ebookOriginalName }: Props) {
  const fileUrl = `/api/library/${encodeURIComponent(slug)}/file`;
  const downloadUrl = `${fileUrl}?download=1`;

  return (
    <div className="reader-page">
      <section className="reader-toolbar">
        <div>
          <p className="tag">Livro na sua biblioteca</p>
          <h1>{title}</h1>
          {hasEbook && <p className="muted">Arquivo: {ebookOriginalName}</p>}
        </div>
        <div className="form-actions">
          {hasEbook && <a className="btn sm ghost" href={downloadUrl}>Baixar arquivo</a>}
          <Link className="btn sm" href="/meus-livros">Voltar à estante</Link>
        </div>
      </section>

      {!hasEbook ? (
        <section className="panel">
          <p>Seu acesso a este livro foi confirmado, mas o arquivo digital ainda não foi cadastrado.</p>
          <p className="muted">Quando um PDF ou EPUB real for anexado pelo Admin, ele aparecerá aqui sem ficar publicamente exposto.</p>
        </section>
      ) : ebookMimeType === "application/pdf" ? (
        <iframe className="pdf-reader" src={fileUrl} title={`Leitor de ${title}`} />
      ) : (
        <section className="panel">
          <h2>Arquivo EPUB pronto</h2>
          <p>O EPUB está protegido e disponível para download. Para abrir no navegador, use um leitor EPUB compatível.</p>
          <a className="btn" href={downloadUrl}>Baixar EPUB</a>
        </section>
      )}
    </div>
  );
}
