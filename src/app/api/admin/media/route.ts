import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import {
  MAX_EBOOK_BYTES,
  MAX_IMAGE_BYTES,
  removeStoredEbook,
  removeStoredImage,
  storeEbook,
  storeImage,
} from "@/lib/media-storage";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function isUpload(value: FormDataEntryValue | null): value is File {
  return value !== null && typeof value !== "string" && typeof value.arrayBuffer === "function";
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Origem não autorizada.", 403);
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_EBOOK_BYTES + 1024 * 1024) {
    return jsonError("O envio ultrapassa o limite de tamanho.", 413);
  }

  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Entre na conta administrativa para enviar arquivos.", 401);
    if (user.role === "USER") return jsonError("Somente a equipe pode enviar arquivos.", 403);

    const form = await request.formData();
    const entityType = form.get("entityType");
    const entityId = form.get("entityId");
    const kind = form.get("kind");
    const file = form.get("file");
    if (typeof entityType !== "string" || typeof entityId !== "string" || typeof kind !== "string" || !isUpload(file)) {
      return jsonError("Selecione um arquivo válido para o registro.", 400);
    }

    const authorPhoto = entityType === "author" && kind === "photo";
    const bookCover = entityType === "book" && kind === "cover";
    const bookEbook = entityType === "book" && kind === "ebook";
    if (!authorPhoto && !bookCover && !bookEbook) return jsonError("Tipo de mídia não permitido.", 400);
    if (file.size > (bookEbook ? MAX_EBOOK_BYTES : MAX_IMAGE_BYTES)) {
      return jsonError(bookEbook ? "O e-book deve ter no máximo 50 MiB." : "A imagem deve ter no máximo 5 MiB.", 413);
    }

    const db = getDb();
    if (authorPhoto) {
      const author = await db.author.findUnique({ where: { id: entityId }, select: { id: true, photoUrl: true, published: true } });
      if (!author) return jsonError("Autor não encontrado.", 404);
      if (user.role === "EMPLOYEE" && author.published) return jsonError("Funcionários só podem enviar mídia para autores não publicados.", 403);

      const stored = await storeImage(file, "authors");
      if (!stored.ok) return jsonError(stored.error, 400);
      try {
        await db.author.update({ where: { id: entityId }, data: { photoUrl: stored.value.url } });
      } catch {
        await removeStoredImage(stored.value.url, "authors");
        return jsonError("Não foi possível salvar a foto do autor.", 503);
      }
      await removeStoredImage(author.photoUrl, "authors");
      revalidatePath("/admin");
      revalidatePath("/autor/[slug]", "page");
      return Response.json({ url: stored.value.url, size: stored.value.size, mimeType: stored.value.mimeType });
    }

    const book = await db.book.findUnique({
      where: { id: entityId },
      select: { id: true, slug: true, coverImageUrl: true, ebookStorageKey: true, published: true },
    });
    if (!book) return jsonError("Livro não encontrado.", 404);
    if (user.role === "EMPLOYEE" && book.published) return jsonError("Funcionários só podem enviar mídia para livros não publicados.", 403);

    if (bookCover) {
      const stored = await storeImage(file, "covers");
      if (!stored.ok) return jsonError(stored.error, 400);
      try {
        await db.book.update({ where: { id: entityId }, data: { coverImageUrl: stored.value.url } });
      } catch {
        await removeStoredImage(stored.value.url, "covers");
        return jsonError("Não foi possível salvar a capa do livro.", 503);
      }
      await removeStoredImage(book.coverImageUrl, "covers");
      revalidatePath("/admin");
      revalidatePath("/livro/[slug]", "page");
      revalidatePath("/");
      return Response.json({ url: stored.value.url, size: stored.value.size, mimeType: stored.value.mimeType });
    }

    const stored = await storeEbook(file);
    if (!stored.ok) return jsonError(stored.error, 400);
    try {
      await db.book.update({
        where: { id: entityId },
        data: {
          ebookStorageKey: stored.value.storageKey,
          ebookMimeType: stored.value.mimeType,
          ebookOriginalName: stored.value.originalName,
          ebookSize: stored.value.size,
        },
      });
    } catch {
      await removeStoredEbook(stored.value.storageKey);
      return jsonError("Não foi possível salvar o arquivo do livro.", 503);
    }
    await removeStoredEbook(book.ebookStorageKey);
    revalidatePath("/admin");
    revalidatePath("/meus-livros");
    revalidatePath("/leitor/[slug]", "page");
    return Response.json({
      fileName: stored.value.originalName,
      size: stored.value.size,
      mimeType: stored.value.mimeType,
    });
  } catch {
    return jsonError("Não foi possível processar o envio agora. Tente novamente.", 503);
  }
}
