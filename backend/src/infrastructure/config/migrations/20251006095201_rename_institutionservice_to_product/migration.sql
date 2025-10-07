-- Renommer la table
ALTER TABLE "InstitutionService" RENAME TO "Product";

-- (Optionnel mais propre) Renommer l'index généré par Prisma sur institutionId
-- Le nom exact dépend de la version / historique. Par défaut Prisma crée souvent :
-- "InstitutionService_institutionId_idx"
DO $$
BEGIN
  IF to_regclass('"InstitutionService_institutionId_idx"') IS NOT NULL THEN
    ALTER INDEX "InstitutionService_institutionId_idx" RENAME TO "Product_institutionId_idx";
  END IF;
END$$;

-- Renommer la contrainte FK si elle existe sous ce nom
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'InstitutionService_institutionId_fkey'
  ) THEN
    ALTER TABLE "Product" RENAME CONSTRAINT "InstitutionService_institutionId_fkey" TO "Product_institutionId_fkey";
  END IF;
END$$;

-- Renommer le type enum
ALTER TYPE "InstitutionServiceType" RENAME TO "ProductType";
