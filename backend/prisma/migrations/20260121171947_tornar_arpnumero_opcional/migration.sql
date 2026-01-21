-- DropIndex
DROP INDEX "Ata_arpNumero_key";

-- AlterTable
ALTER TABLE "Ata" ALTER COLUMN "arpNumero" DROP NOT NULL;
