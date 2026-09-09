CREATE TABLE "sugestii" (
    "id" TEXT NOT NULL,
    "ferma_id" TEXT NOT NULL,
    "utilizator_id" TEXT NOT NULL,
    "mesaj" TEXT NOT NULL,
    "data_creare" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sugestii_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "sugestii" ADD CONSTRAINT "sugestii_ferma_id_fkey" FOREIGN KEY ("ferma_id") REFERENCES "ferme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sugestii" ADD CONSTRAINT "sugestii_utilizator_id_fkey" FOREIGN KEY ("utilizator_id") REFERENCES "utilizatori"("id") ON DELETE CASCADE ON UPDATE CASCADE;
