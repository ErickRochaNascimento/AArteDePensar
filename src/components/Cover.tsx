import type { CSSProperties } from "react";
import type { Book } from "@/lib/data";

type Props = {
  book: Pick<Book, "title" | "author" | "category" | "c1" | "c2">;
  className?: string;
};

// Capa gerada em CSS (enquanto não há imagens reais de capa).
export function Cover({ book, className }: Props) {
  return (
    <div
      className={className ? `cover ${className}` : "cover"}
      style={{ "--c1": book.c1, "--c2": book.c2 } as CSSProperties}
      aria-hidden="true"
    >
      <em>{book.category}</em>
      <i>{book.title}</i>
      <em>{book.author}</em>
    </div>
  );
}
