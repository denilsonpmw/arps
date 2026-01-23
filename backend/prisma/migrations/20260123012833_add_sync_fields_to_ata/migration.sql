/*
  Warnings:

  - A unique constraint covering the columns `[source_id]` on the table `Ata` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Ata" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "local_override" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source_id" TEXT,
ADD COLUMN     "updated_at_source" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Ata_source_id_key" ON "Ata"("source_id");
