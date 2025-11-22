-- DropForeignKey
ALTER TABLE "Guitarra" DROP CONSTRAINT "Guitarra_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Proposta" DROP CONSTRAINT "Proposta_adminId_fkey";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nivel" SMALLINT NOT NULL DEFAULT 2,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "cidade" TEXT;

-- AlterTable
ALTER TABLE "Guitarra" ALTER COLUMN "adminId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Proposta" ALTER COLUMN "resposta" DROP NOT NULL,
ALTER COLUMN "adminId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Guitarra" ADD CONSTRAINT "Guitarra_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
