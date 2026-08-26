-- Unifica "mutatie" si "culoare" intr-un singur camp cu valori multiple ("mutatii").
-- Pastreaza datele existente: fiecare valoare non-nula devine un element in noul array.

ALTER TABLE "pasari" ADD COLUMN "mutatii" TEXT[] NOT NULL DEFAULT '{}';

UPDATE "pasari"
SET "mutatii" = ARRAY_REMOVE(ARRAY["mutatie", "culoare"], NULL)
WHERE "mutatie" IS NOT NULL OR "culoare" IS NOT NULL;

ALTER TABLE "pasari" DROP COLUMN "mutatie";
ALTER TABLE "pasari" DROP COLUMN "culoare";
