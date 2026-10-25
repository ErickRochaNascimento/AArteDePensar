-- Imagens do catálogo são públicas; ebookStorageKey aponta para storage/books fora de public/.
ALTER TABLE `authors`
  ADD COLUMN `photoUrl` VARCHAR(255) NULL;

ALTER TABLE `books`
  ADD COLUMN `coverImageUrl` VARCHAR(255) NULL,
  ADD COLUMN `ebookStorageKey` VARCHAR(80) NULL,
  ADD COLUMN `ebookMimeType` VARCHAR(100) NULL,
  ADD COLUMN `ebookOriginalName` VARCHAR(255) NULL,
  ADD COLUMN `ebookSize` INTEGER NULL,
  ADD UNIQUE INDEX `books_ebookStorageKey_key`(`ebookStorageKey`);
