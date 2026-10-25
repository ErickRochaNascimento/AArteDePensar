import { MediaUploader } from "@/components/MediaUploader";

type Props = {
  bookId: string;
  coverImageUrl?: string | null;
  hasEbook: boolean;
  ebookMimeType?: string | null;
  ebookOriginalName?: string | null;
  ebookSize?: number | null;
};

export function BookMediaManager({
  bookId,
  coverImageUrl,
  hasEbook,
  ebookMimeType,
  ebookOriginalName,
  ebookSize,
}: Props) {
  return (
    <section className="book-media-manager" aria-labelledby="book-media-heading">
      <h3 id="book-media-heading">Fotos e arquivo do livro</h3>
      <p className="muted">
        As imagens aparecem no catálogo. O EPUB/PDF fica privado e só pode ser baixado por quem tem este livro na estante.
      </p>
      <div className="media-grid">
        <MediaUploader entityType="book" entityId={bookId} kind="cover" currentUrl={coverImageUrl} />
        <MediaUploader
          entityType="book"
          entityId={bookId}
          kind="ebook"
          currentFileName={hasEbook ? ebookOriginalName : null}
          currentSize={hasEbook ? ebookSize : null}
          currentMimeType={hasEbook ? ebookMimeType : null}
        />
      </div>
    </section>
  );
}
