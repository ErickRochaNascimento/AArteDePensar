import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { getCurrentUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { getEbookPath } from "@/lib/media-storage";

type RouteContext = { params: Promise<{ slug: string }> };

function attachmentName(original: string | null, extension: string) {
  const leaf = basename((original ?? `livro.${extension}`).replaceAll("\\", "/"))
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/["\\]/g, "_")
    .slice(0, 180) || `livro.${extension}`;
  const fallback = leaf.replace(/[^\x20-\x7e]/g, "_");
  const encoded = encodeURIComponent(leaf).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
  return `filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Autenticação necessária." }, { status: 401 });

    const { slug } = await params;
    const book = await getDb().book.findUnique({
      where: { slug },
      select: {
        id: true,
        ebookStorageKey: true,
        ebookMimeType: true,
        ebookOriginalName: true,
      },
    });
    if (!book?.ebookStorageKey) return new Response("Not found", { status: 404 });

    const entitlement = await getDb().libraryItem.findUnique({
      where: { userId_bookId: { userId: user.id, bookId: book.id } },
      select: { id: true },
    });
    if (!entitlement) return new Response("Not found", { status: 404 });

    const filePath = getEbookPath(book.ebookStorageKey);
    const extension = book.ebookStorageKey.toLowerCase().endsWith(".pdf") ? "pdf" : "epub";
    const contentType = extension === "pdf" ? "application/pdf" : "application/epub+zip";
    if (!filePath || book.ebookMimeType !== contentType) return new Response("Not found", { status: 404 });

    let data: Buffer;
    try {
      data = await readFile(filePath);
    } catch {
      return new Response("File unavailable", { status: 404 });
    }

    const download = new URL(request.url).searchParams.get("download") === "1";
    const disposition = download || extension === "epub" ? "attachment" : "inline";
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(data.byteLength),
        "Content-Disposition": `${disposition}; ${attachmentName(book.ebookOriginalName, extension)}`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "Cross-Origin-Resource-Policy": "same-origin",
      },
    });
  } catch {
    return Response.json({ error: "Não foi possível liberar o arquivo." }, { status: 503 });
  }
}
