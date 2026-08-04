-- AlterEnum
BEGIN;
CREATE TYPE "StatusPereche_new" AS ENUM ('ACTIVA', 'INACTIVA');
ALTER TABLE "perechi" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "perechi" ALTER COLUMN "status" TYPE "StatusPereche_new" USING ("status"::text::"StatusPereche_new");
ALTER TYPE "StatusPereche" RENAME TO "StatusPereche_old";
ALTER TYPE "StatusPereche_new" RENAME TO "StatusPereche";
DROP TYPE "StatusPereche_old";
ALTER TABLE "perechi" ALTER COLUMN "status" SET DEFAULT 'ACTIVA';
COMMIT;
