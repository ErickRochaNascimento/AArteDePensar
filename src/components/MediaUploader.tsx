"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Props = {
  entityType: "author" | "book";
  entityId: string | null;
  kind: "photo" | "cover" | "ebook";
  currentUrl?: string | null;
  currentFileName?: string | null;
  currentSize?: number | null;
  currentMimeType?: string | null;
  canUpload?: boolean;
};

type UploadResponse = {
  url?: string;
  fileName?: string;
  size: number;
  mimeType: string;
  error?: string;
};

const IMAGE_LIMIT = 5 * 1024 * 1024;
const EBOOK_LIMIT = 50 * 1024 * 1024;

function bytesLabel(bytes: number | null | undefined) {
  if (!bytes) return "";
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaUploader({
  entityType,
  entityId,
  kind,
  currentUrl,
  currentFileName,
  currentSize,
  currentMimeType,
  canUpload = true,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(currentUrl ?? "");
  const [fileName, setFileName] = useState(currentFileName ?? "");
  const [fileSize, setFileSize] = useState(currentSize ?? 0);
  const [mimeType, setMimeType] = useState(currentMimeType ?? "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const isEbook = kind === "ebook";
  const title = kind === "photo" ? "Foto do autor" : kind === "cover" ? "Capa do livro" : "Arquivo digital do livro";
  const accept = isEbook
    ? ".pdf,.epub,application/pdf,application/epub+zip"
    : ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
  const limit = isEbook ? EBOOK_LIMIT : IMAGE_LIMIT;

  function selectFile(selected: File | null) {
    setError("");
    setMessage("");
    if (selected && selected.size > limit) {
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      setError(isEbook ? "O e-book deve ter no máximo 50 MiB." : "A imagem deve ter no máximo 5 MiB.");
      return;
    }
    setFile(selected);
  }

  async function upload() {
    if (!entityId) {
      setError("Salve primeiro os dados para gerar o ID do registro.");
      return;
    }
    if (!file) {
      setError("Selecione um arquivo antes de enviar.");
      return;
    }
    setPending(true);
    setError("");
    setMessage("");
    const formData = new FormData();
    formData.set("entityType", entityType);
    formData.set("entityId", entityId);
    formData.set("kind", kind);
    formData.set("file", file);

    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });
      const result = await response.json() as UploadResponse;
      if (!response.ok) throw new Error(result.error ?? "Não foi possível enviar o arquivo.");
      if (result.url) setImageUrl(result.url);
      if (result.fileName) setFileName(result.fileName);
      setFileSize(result.size);
      setMimeType(result.mimeType);
      setMessage(`${isEbook ? "Arquivo salvo" : "Imagem salva"} (${bytesLabel(result.size)}).`);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Falha ao enviar o arquivo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="media-uploader" aria-label={title}>
      <div className="media-uploader-heading">
        <div>
          <h4>{title}</h4>
          <p className="muted">{isEbook ? "PDF ou EPUB • máximo 50 MiB" : "JPEG, PNG ou WebP • máximo 5 MiB"}</p>
        </div>
        {imageUrl && !isEbook && (
          <Image
            src={imageUrl}
            width={kind === "photo" ? 88 : 72}
            height={kind === "photo" ? 88 : 108}
            alt={kind === "photo" ? "Foto atual do autor" : "Capa atual do livro"}
            className={kind === "photo" ? "media-preview media-preview-round" : "media-preview"}
            unoptimized
          />
        )}
      </div>
      {isEbook && fileName && (
        <p className="media-current-file" aria-live="polite">
          Arquivo atual: <b>{fileName}</b> · {bytesLabel(fileSize)}{mimeType ? ` · ${mimeType}` : ""}
        </p>
      )}
      {isEbook && !fileName && <p className="muted">Nenhum EPUB/PDF cadastrado.</p>}
      {!isEbook && !imageUrl && <p className="muted">Nenhuma imagem cadastrada.</p>}
      {!canUpload && <p className="muted">Somente um administrador pode alterar mídias de registros publicados.</p>}
      {!entityId && <p className="muted">Você pode escolher o arquivo agora; salve os dados para habilitar o envio.</p>}
      <div className="media-upload-controls">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={!canUpload || pending}
          aria-label={`Selecionar ${title.toLowerCase()}`}
          onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
        />
        <button className="btn sm" type="button" onClick={upload} disabled={!canUpload || pending || !file || !entityId}>
          {pending ? "Enviando…" : entityId ? "Enviar arquivo" : "Salve para enviar"}
        </button>
      </div>
      {file && <small className="muted">Selecionado: {file.name} · {bytesLabel(file.size)}</small>}
      {error && <p className="error" role="alert">{error}</p>}
      {message && <p className="ok" role="status">{message}</p>}
    </section>
  );
}
