"use client";

import { useState } from "react";

// Visual da avaliação. A regra "só quem comprou avalia" e o salvamento
// no banco entram na Entrega 3 (Extra: Avaliações de livros).
export function ReviewForm() {
  const [stars, setStars] = useState(5);

  return (
    <form className="rev" onSubmit={(e) => e.preventDefault()}>
      <b>Deixe sua avaliação</b>
      <div className="chips" role="group" aria-label="Nota">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className="chip"
            aria-pressed={n === stars}
            onClick={() => setStars(n)}
          >
            {n} ★
          </button>
        ))}
      </div>
      <label className="sr-only" htmlFor="review-text">
        Comentário
      </label>
      <textarea
        id="review-text"
        rows={3}
        placeholder="Compre o livro para avaliar e escrever seu comentário"
        disabled
      />
      <div>
        <button className="btn sm" type="submit" disabled>
          Publicar avaliação
        </button>
      </div>
    </form>
  );
}
