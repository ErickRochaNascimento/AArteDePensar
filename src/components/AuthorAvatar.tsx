import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { initials, type Author } from "@/lib/data";

export function AuthorAvatar({ author }: { author: Author }) {
  return (
    <Link className="author" href={`/autor/${author.slug}`}>
      <div className="av" style={{ "--c1": author.color } as CSSProperties}>
        {author.photoUrl ? (
          <Image className="avatar-photo" src={author.photoUrl} alt="" fill sizes="100px" unoptimized />
        ) : initials(author.name)}
      </div>
      <span>{author.name}</span>
    </Link>
  );
}
