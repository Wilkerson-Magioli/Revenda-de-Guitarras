/*
  Warnings:

  - You are about to drop the column `acessorios` on the `Guitarra` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Guitarra" DROP COLUMN "acessorios",
ADD COLUMN     "acessorio" TEXT;

-- AddForeignKey
ALTER TABLE "Guitarra" ADD CONSTRAINT "Guitarra_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guitarra" ADD CONSTRAINT "Guitarra_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_guitarraId_fkey" FOREIGN KEY ("guitarraId") REFERENCES "Guitarra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
