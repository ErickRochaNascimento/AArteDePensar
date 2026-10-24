"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";

const CHAPTERS = ["Capa", "1. A carta", "2. O cais", "3. Dona Zilda", "4. Maré baixa", "5. O retorno"];

// Leitor de exemplo. Na Entrega 3 o conteúdo real vem do arquivo EPUB/PDF
// (epub.js / PDF.js) servido por rota que confere se o usuário comprou o livro.
export function ReaderClient({ title }: { title: string }) {
  const [fs, setFs] = useState(19);
  const change = (delta: number) => setFs((v) => Math.min(26, Math.max(15, v + delta)));

  return (
    <div className="reader">
      <nav className="toc" aria-label="Capítulos">
        <b style={{ marginBottom: 8 }}>{title}</b>
        {CHAPTERS.map((c, i) => (
          <button
            key={c}
            type="button"
            className="toc-item"
            aria-current={i === 2 ? "page" : undefined}
          >
            {c}
          </button>
        ))}
        <hr className="hr" style={{ marginBlock: 12 }} />
        <button type="button" className="btn sm ghost">
          Baixar EPUB
        </button>
        <button type="button" className="btn sm ghost">
          Baixar PDF
        </button>
      </nav>

      <div className="page">
        <div className="tools">
          <button type="button" className="btn sm ghost" onClick={() => change(-2)} aria-label="Diminuir letra">
            A−
          </button>
          <button type="button" className="btn sm ghost" onClick={() => change(2)} aria-label="Aumentar letra">
            A+
          </button>
          <span className="muted">Capítulo 2 de 5 · página 74 de 312</span>
          <Link className="btn sm ghost" href="/meus-livros">
            Voltar à estante
          </Link>
        </div>

        <article className="text" style={{ "--fs": `${fs}px` } as CSSProperties}>
          <h2>2. O cais</h2>
          <p>
            O último barco partiu antes do meio-dia, e o cais ficou com aquele silêncio de lugar
            que acabou de perder alguma coisa. Marta ficou parada junto ao poste, segurando a
            carta dobrada em quatro.
          </p>
          <p>
            Dona Zilda dizia que as cartas pesam mais do que parecem. Marta nunca entendeu a
            frase até aquele dia, quando o papel começou a ficar úmido entre os dedos.
          </p>
          <p>
            Do outro lado da baía, o farol acendeu antes da hora, como se também quisesse avisar
            alguém.
          </p>
        </article>

        <div className="tools">
          <button type="button" className="btn sm">
            ← Anterior
          </button>
          <div className="prog" style={{ width: 160 }}>
            <b style={{ width: "24%" }} />
          </div>
          <button type="button" className="btn sm">
            Próxima →
          </button>
        </div>
      </div>
    </div>
  );
}
