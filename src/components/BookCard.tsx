import Link from "next/link";
import { formatBRL, type Book } from "@/lib/data";
import { Cover } from "./Cover";

export function BookCard({ book }: { book: Book }) {
  return (
    <Link className="card" href={`/livro/${book.slug}`}>
      <Cover book={book} />
      <h3>{book.title}</h3>
      <small>
        {book.author} · {book.year}
      </small>
      <div className="fmt">
        <span>Ler online</span>
        <span>EPUB</span>
        <span>PDF</span>
      </div>
      <div className="price">
        a partir de <b>{formatBRL(book.price)}</b>
      </div>
    </Link>
  );
}
