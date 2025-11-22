/*
  Warnings:

  - You are about to drop the column `cidade` on the `Cliente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "cidade",
ADD COLUMN     "telefone" TEXT;
