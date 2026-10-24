"use client";

import { useState } from "react";
import type { Book } from "@/lib/data";
import { BookCard } from "./BookCard";

export function CatalogGrid({
  books,
  categories,
}: {
  books: Book[];
  categories: string[];
}) {
  const [category, setCategory] = useState("Todos");
  const visible = category === "Todos" ? books : books.filter((b) => b.category === category);

  return (
    <>
      <div className="chips" role="group" aria-label="Filtrar por categoria">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            className="chip"
            aria-pressed={c === category}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {visible.length > 0 ? (
        <div className="row">
          {visible.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      ) : (
        <p className="muted">Nenhum livro encontrado nesta categoria.</p>
      )}
    </>
  );
}
