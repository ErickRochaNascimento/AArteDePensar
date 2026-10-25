import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_EBOOK_BYTES = 50 * 1024 * 1024;
const UUID_FILE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|pdf|epub)$/i;

export type ImageBucket = "authors" | "covers";
export type SaveResult<T> = { ok: true; value: T } | { ok: false; error: string };

export type StoredImage = { url: string; size: number; mimeType: string };
export type StoredEbook = {
  storageKey: string;
  originalName: string;
  size: number;
  mimeType: "application/pdf" | "application/epub+zip";
};

function normalizedMime(type: string) {
  return type.trim().toLowerCase().split(";")[0] ?? "";
}

function imageTypeFromSignature(data: Buffer): { mimeType: string; extension: string } | null {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return { mimeType: "image/jpeg", extension: "jpg" };
  }
  if (data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { mimeType: "image/png", extension: "png" };
  }
  if (data.length >= 12 && data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP") {
    return { mimeType: "image/webp", extension: "webp" };
  }
  return null;
}

function safeOriginalName(input: string, extension: string) {
  const leaf = basename(input.replaceAll("\\", "/"))
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[<>:"|?*]/g, "_")
    .trim()
    .slice(0, 240);
  return leaf || `livro.${extension}`;
}

export async function storeImage(file: File, bucket: ImageBucket): Promise<SaveResult<StoredImage>> {
  if (!file.size) return { ok: false, error: "O arquivo de imagem está vazio." };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: "A imagem deve ter no máximo 5 MiB." };

  const extension = extname(file.name).toLowerCase();
  const data = Buffer.from(await file.arrayBuffer());
  const actual = imageTypeFromSignature(data);
  if (!actual) return { ok: false, error: "Envie uma imagem JPEG, PNG ou WebP válida." };

  const extensionMatches = actual.mimeType === "image/jpeg"
    ? extension === ".jpg" || extension === ".jpeg"
    : extension === `.${actual.extension}`;
  const declared = normalizedMime(file.type);
  if (!extensionMatches || (declared && declared !== actual.mimeType && declared !== "application/octet-stream")) {
    return { ok: false, error: "A extensão, o tipo e o conteúdo da imagem não correspondem." };
  }

  const key = `${randomUUID()}.${actual.extension}`;
  const directory = join(process.cwd(), "storage", "uploads", bucket);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, key), data, { flag: "wx" });
  return { ok: true, value: { url: `/api/media/${bucket}/${key}`, size: data.byteLength, mimeType: actual.mimeType } };
}

export async function storeEbook(file: File): Promise<SaveResult<StoredEbook>> {
  if (!file.size) return { ok: false, error: "O arquivo do livro está vazio." };
  if (file.size > MAX_EBOOK_BYTES) return { ok: false, error: "O arquivo EPUB/PDF deve ter no máximo 50 MiB." };

  const extension = extname(file.name).toLowerCase();
  if (extension !== ".pdf" && extension !== ".epub") {
    return { ok: false, error: "Envie somente arquivos PDF ou EPUB." };
  }

  const data = Buffer.from(await file.arrayBuffer());
  const declared = normalizedMime(file.type);
  let mimeType: StoredEbook["mimeType"];

  if (extension === ".pdf") {
    if (data.length < 5 || data.toString("ascii", 0, 5) !== "%PDF-") {
      return { ok: false, error: "O conteúdo enviado não é um PDF válido." };
    }
    if (declared && declared !== "application/pdf" && declared !== "application/octet-stream") {
      return { ok: false, error: "O tipo informado não corresponde ao PDF enviado." };
    }
    mimeType = "application/pdf";
  } else {
    const isZip = data.length >= 4 && data[0] === 0x50 && data[1] === 0x4b && data[2] === 0x03 && data[3] === 0x04;
    const hasEpubMarkers = data.includes(Buffer.from("mimetype"))
      && data.includes(Buffer.from("application/epub+zip"))
      && data.includes(Buffer.from("META-INF/container.xml"));
    if (!isZip || !hasEpubMarkers) return { ok: false, error: "O arquivo não tem a estrutura esperada de um EPUB." };
    if (declared && declared !== "application/epub+zip" && declared !== "application/zip" && declared !== "application/octet-stream") {
      return { ok: false, error: "O tipo informado não corresponde ao EPUB enviado." };
    }
    mimeType = "application/epub+zip";
  }

  const storageKey = `${randomUUID()}${extension}`;
  const directory = join(process.cwd(), "storage", "books");
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, storageKey), data, { flag: "wx" });

  return {
    ok: true,
    value: {
      storageKey,
      originalName: safeOriginalName(file.name, extension.slice(1)),
      size: data.byteLength,
      mimeType,
    },
  };
}

export function getImagePath(bucket: ImageBucket, key: string) {
  if (!UUID_FILE.test(key) || /\.(pdf|epub)$/i.test(key)) return null;
  return join(process.cwd(), "storage", "uploads", bucket, key);
}

export function getEbookPath(key: string) {
  if (!UUID_FILE.test(key) || !/\.(pdf|epub)$/i.test(key)) return null;
  return join(process.cwd(), "storage", "books", key);
}

export async function readImage(bucket: ImageBucket, key: string) {
  const path = getImagePath(bucket, key);
  if (!path) return null;
  try {
    return await readFile(path);
  } catch {
    return null;
  }
}

export async function removeStoredImage(url: string | null | undefined, bucket: ImageBucket) {
  const prefix = `/api/media/${bucket}/`;
  if (!url?.startsWith(prefix)) return;
  const key = url.slice(prefix.length);
  const path = getImagePath(bucket, key);
  if (!path) return;
  await unlink(path).catch(() => undefined);
}

export async function removeStoredEbook(key: string | null | undefined) {
  if (!key) return;
  const path = getEbookPath(key);
  if (!path) return;
  await unlink(path).catch(() => undefined);
}

export function imageMimeType(key: string) {
  const extension = extname(key).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  return null;
}
