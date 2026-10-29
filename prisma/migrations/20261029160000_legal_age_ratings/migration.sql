-- Consentimento fica nulo para contas existentes; novos cadastros gravam horário e versão.
ALTER TABLE `users`
  ADD COLUMN `termsAcceptedAt` DATETIME(3) NULL,
  ADD COLUMN `termsVersion` VARCHAR(32) NULL;

-- NULL preserva como pendentes os livros existentes até que a equipe os classifique.
ALTER TABLE `books`
  ADD COLUMN `ageRating` ENUM('LIVRE', 'MAIS_12', 'MAIS_14', 'MAIS_16', 'MAIS_18') NULL;
