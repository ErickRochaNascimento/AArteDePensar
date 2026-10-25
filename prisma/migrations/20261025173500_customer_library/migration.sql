-- Relação de acesso persistente à biblioteca; pedidos/pagamentos serão implementados na Entrega 5.
CREATE TABLE `library_items` (
    `id` VARCHAR(30) NOT NULL,
    `userId` VARCHAR(30) NOT NULL,
    `bookId` VARCHAR(30) NOT NULL,
    `progressPercent` INTEGER NOT NULL DEFAULT 0,
    `acquiredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastReadAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `library_items_userId_bookId_key`(`userId`, `bookId`),
    INDEX `library_items_userId_acquiredAt_idx`(`userId`, `acquiredAt`),
    INDEX `library_items_bookId_idx`(`bookId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `library_items`
  ADD CONSTRAINT `library_items_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `library_items`
  ADD CONSTRAINT `library_items_bookId_fkey`
  FOREIGN KEY (`bookId`) REFERENCES `books`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;
