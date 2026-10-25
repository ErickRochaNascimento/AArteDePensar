import type { CSSProperties } from "react";
import Image from "next/image";
import type { Book } from "@/lib/data";

type Props = {
  book: Pick<Book, "title" | "author" | "category" | "c1" | "c2" | "coverImageUrl">;
  className?: string;
};

export function Cover({ book, className }: Props) {
  return (
    <div
      className={`${className ? `cover ${className}` : "cover"}${book.coverImageUrl ? " cover-with-image" : ""}`}
      style={{ "--c1": book.c1, "--c2": book.c2 } as CSSProperties}
      aria-hidden="true"
    >
      {book.coverImageUrl ? (
        <Image className="cover-image" src={book.coverImageUrl} alt="" fill sizes="(max-width: 640px) 45vw, 180px" unoptimized />
      ) : (
        <>
          <em>{book.category}</em>
          <i>{book.title}</i>
          <em>{book.author}</em>
        </>
      )}
    </div>
  );
}
