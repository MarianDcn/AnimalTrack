-- AlterEnum
ALTER TYPE "StatusPasare" ADD VALUE 'DONATA';

-- AlterTable
ALTER TABLE "pasari" ADD COLUMN     "achizitionata_din_afara" BOOLEAN NOT NULL DEFAULT false;
