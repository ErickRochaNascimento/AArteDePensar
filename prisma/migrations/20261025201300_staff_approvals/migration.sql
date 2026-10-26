-- Add the employee role without changing existing customer/admin assignments.
ALTER TABLE `users`
  MODIFY `role` ENUM('USER', 'EMPLOYEE', 'ADMIN') NOT NULL DEFAULT 'USER';

-- Existing authors remain public; authors created after this migration start unpublished.
ALTER TABLE `authors`
  ADD COLUMN `published` BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE `authors`
  ALTER COLUMN `published` SET DEFAULT FALSE;

CREATE TABLE `catalog_changes` (
    `id` VARCHAR(30) NOT NULL,
    `entityType` ENUM('BOOK', 'AUTHOR') NOT NULL,
    `entityId` VARCHAR(30) NOT NULL,
    `payload` JSON NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `submittedById` VARCHAR(30) NOT NULL,
    `reviewedById` VARCHAR(30) NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewedAt` DATETIME(3) NULL,

    INDEX `catalog_changes_status_submittedAt_idx`(`status`, `submittedAt`),
    INDEX `catalog_changes_entityType_entityId_status_idx`(`entityType`, `entityId`, `status`),
    INDEX `catalog_changes_submittedById_idx`(`submittedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `catalog_changes`
  ADD CONSTRAINT `catalog_changes_submittedById_fkey`
  FOREIGN KEY (`submittedById`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `catalog_changes`
  ADD CONSTRAINT `catalog_changes_reviewedById_fkey`
  FOREIGN KEY (`reviewedById`) REFERENCES `users`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
