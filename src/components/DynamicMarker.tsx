import { Suspense } from "react";
import { connection } from "next/server";

// As páginas /livro, /autor e /leitor leem o banco também em generateMetadata.
// Este marcador avisa o Next.js (Cache Components) que a rota depende da
// requisição, sem impedir que o restante da página use Suspense.
export function DynamicMarker() {
  return (
    <Suspense>
      <Connection />
    </Suspense>
  );
}

async function Connection() {
  await connection();
  return null;
}
