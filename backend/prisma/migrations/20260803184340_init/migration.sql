-- CreateEnum
CREATE TYPE "RolUtilizator" AS ENUM ('ADMIN', 'ANGAJAT');

-- CreateEnum
CREATE TYPE "SexPasare" AS ENUM ('MASCUL', 'FEMELA', 'NECUNOSCUT');

-- CreateEnum
CREATE TYPE "StatusPasare" AS ENUM ('ACTIVA', 'VANDUTA', 'DECEDATA', 'TRANSFERATA');

-- CreateEnum
CREATE TYPE "StatusPereche" AS ENUM ('ACTIVA', 'SEPARATA', 'ARHIVATA');

-- CreateEnum
CREATE TYPE "StatusOu" AS ENUM ('DEPUS', 'FECUNDAT', 'NEFECUNDAT', 'ECLOZAT', 'PIERDUT');

-- CreateEnum
CREATE TYPE "TipFotografie" AS ENUM ('ADULT', 'PUI', 'PARINTI');

-- CreateTable
CREATE TABLE "ferme" (
    "id" TEXT NOT NULL,
    "nume" TEXT NOT NULL,
    "adresa" TEXT,
    "data_creare" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ferme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilizatori" (
    "id" TEXT NOT NULL,
    "ferma_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "parola_hash" TEXT NOT NULL,
    "rol" "RolUtilizator" NOT NULL DEFAULT 'ADMIN',
    "data_creare" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilizatori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pasari" (
    "id" TEXT NOT NULL,
    "ferma_id" TEXT NOT NULL,
    "nr_inel" TEXT NOT NULL,
    "nume" TEXT,
    "data_eclozare" TIMESTAMP(3),
    "sex" "SexPasare" NOT NULL DEFAULT 'NECUNOSCUT',
    "mutatie" TEXT,
    "culoare" TEXT,
    "tata_id" TEXT,
    "mama_id" TEXT,
    "observatii" TEXT,
    "status" "StatusPasare" NOT NULL DEFAULT 'ACTIVA',
    "data_creare" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pasari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perechi" (
    "id" TEXT NOT NULL,
    "ferma_id" TEXT NOT NULL,
    "mascul_id" TEXT NOT NULL,
    "femela_id" TEXT NOT NULL,
    "data_creare" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusPereche" NOT NULL DEFAULT 'ACTIVA',

    CONSTRAINT "perechi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "serii_cuibarit" (
    "id" TEXT NOT NULL,
    "pereche_id" TEXT NOT NULL,
    "data_imperechere" TIMESTAMP(3),
    "data_prim_ou" TIMESTAMP(3),

    CONSTRAINT "serii_cuibarit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oua" (
    "id" TEXT NOT NULL,
    "serie_id" TEXT NOT NULL,
    "data_depunere" TIMESTAMP(3) NOT NULL,
    "status" "StatusOu" NOT NULL DEFAULT 'DEPUS',
    "pasare_id" TEXT,

    CONSTRAINT "oua_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotografii" (
    "id" TEXT NOT NULL,
    "pasare_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tip" "TipFotografie" NOT NULL,

    CONSTRAINT "fotografii_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilizatori_email_key" ON "utilizatori"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pasari_ferma_id_nr_inel_key" ON "pasari"("ferma_id", "nr_inel");

-- AddForeignKey
ALTER TABLE "utilizatori" ADD CONSTRAINT "utilizatori_ferma_id_fkey" FOREIGN KEY ("ferma_id") REFERENCES "ferme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pasari" ADD CONSTRAINT "pasari_ferma_id_fkey" FOREIGN KEY ("ferma_id") REFERENCES "ferme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pasari" ADD CONSTRAINT "pasari_tata_id_fkey" FOREIGN KEY ("tata_id") REFERENCES "pasari"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pasari" ADD CONSTRAINT "pasari_mama_id_fkey" FOREIGN KEY ("mama_id") REFERENCES "pasari"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perechi" ADD CONSTRAINT "perechi_ferma_id_fkey" FOREIGN KEY ("ferma_id") REFERENCES "ferme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perechi" ADD CONSTRAINT "perechi_mascul_id_fkey" FOREIGN KEY ("mascul_id") REFERENCES "pasari"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perechi" ADD CONSTRAINT "perechi_femela_id_fkey" FOREIGN KEY ("femela_id") REFERENCES "pasari"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serii_cuibarit" ADD CONSTRAINT "serii_cuibarit_pereche_id_fkey" FOREIGN KEY ("pereche_id") REFERENCES "perechi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oua" ADD CONSTRAINT "oua_serie_id_fkey" FOREIGN KEY ("serie_id") REFERENCES "serii_cuibarit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oua" ADD CONSTRAINT "oua_pasare_id_fkey" FOREIGN KEY ("pasare_id") REFERENCES "pasari"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotografii" ADD CONSTRAINT "fotografii_pasare_id_fkey" FOREIGN KEY ("pasare_id") REFERENCES "pasari"("id") ON DELETE CASCADE ON UPDATE CASCADE;
