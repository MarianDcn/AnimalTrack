DROP INDEX "pasari_ferma_id_nr_inel_key";

ALTER TABLE "pasari" ADD COLUMN "an_eclozare" INTEGER;

UPDATE "pasari"
SET "an_eclozare" = EXTRACT(YEAR FROM "data_eclozare")::int
WHERE "data_eclozare" IS NOT NULL;

CREATE UNIQUE INDEX "pasari_ferma_id_nr_inel_rnc_an_eclozare_key"
  ON "pasari"("ferma_id", "nr_inel", "rnc", "an_eclozare");
