"use client";

import { useState } from "react";
import type { Book } from "@/lib/data";
import { BookCard } from "./BookCard";
import { Carousel } from "./Carousel";

export function CatalogCarousel({ books }: { books: Book[] }) {
  const [category, setCategory] = useState("Todos");
  const categories = Array.from(new Set(books.map((b) => b.category))).sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const visible = category === "Todos" ? books : books.filter((b) => b.category === category);

  return (
    <>
      <div className="chips" role="group" aria-label="Filtrar por categoria">
        {["Todos", ...categories].map((c) => (
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
        <Carousel key={category} label="Livros do catálogo">
          {visible.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </Carousel>
      ) : (
        <p className="muted">Nenhum livro encontrado nesta categoria.</p>
      )}
    </>
  );
}
