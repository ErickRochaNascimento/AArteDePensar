import { MediaUploader } from "@/components/MediaUploader";

type Props = {
  bookId: string | null;
  coverImageUrl?: string | null;
  hasEbook: boolean;
  ebookMimeType?: string | null;
  ebookOriginalName?: string | null;
  ebookSize?: number | null;
  canManageMedia?: boolean;
};

export function BookMediaManager({
  bookId,
  coverImageUrl,
  hasEbook,
  ebookMimeType,
  ebookOriginalName,
  ebookSize,
  canManageMedia = true,
}: Props) {
  return (
    <section className="book-media-manager" aria-labelledby="book-media-heading">
      <h3 id="book-media-heading">Foto de capa e arquivo do livro</h3>
      <p className="muted">
        {!canManageMedia
          ? "Somente um administrador pode substituir mídias depois que o livro é publicado."
          : bookId
            ? "A capa aparece no catálogo. O EPUB/PDF fica privado e só pode ser baixado por quem tem este livro na estante."
            : "Você já pode escolher a capa e o arquivo digital. Salve os dados do livro para habilitar o envio."}
      </p>
      <div className="media-grid">
        <MediaUploader
          entityType="book"
          entityId={bookId}
          kind="cover"
          currentUrl={coverImageUrl}
          canUpload={canManageMedia}
        />
        <MediaUploader
          entityType="book"
          entityId={bookId}
          kind="ebook"
          currentFileName={hasEbook ? ebookOriginalName : null}
          currentSize={hasEbook ? ebookSize : null}
          currentMimeType={hasEbook ? ebookMimeType : null}
          canUpload={canManageMedia}
        />
      </div>
    </section>
  );
}
