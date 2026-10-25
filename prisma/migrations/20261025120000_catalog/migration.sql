-- CreateTable
CREATE TABLE `authors` (
    `id` VARCHAR(30) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `bio` TEXT NOT NULL,
    `color` VARCHAR(7) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `authors_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `books` (
    `id` VARCHAR(30) NOT NULL,
    `slug` VARCHAR(160) NOT NULL,
    `title` VARCHAR(160) NOT NULL,
    `authorId` VARCHAR(30) NOT NULL,
    `year` INTEGER NOT NULL,
    `category` VARCHAR(60) NOT NULL,
    `pages` INTEGER NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `synopsis` TEXT NOT NULL,
    `c1` VARCHAR(7) NOT NULL,
    `c2` VARCHAR(7) NOT NULL,
    `rating` DECIMAL(2, 1) NOT NULL DEFAULT 0,
    `reviewCount` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `books_slug_key`(`slug`),
    INDEX `books_authorId_idx`(`authorId`),
    INDEX `books_published_category_idx`(`published`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `books` ADD CONSTRAINT `books_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `authors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
