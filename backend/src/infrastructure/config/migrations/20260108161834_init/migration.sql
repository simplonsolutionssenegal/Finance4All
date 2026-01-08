/* =========================
   ENUMS (SAFE / IDEMPOTENT)
   ========================= */

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InstitutionStatus') THEN
    CREATE TYPE "public"."InstitutionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TypeService') THEN
    CREATE TYPE "public"."TypeService" AS ENUM (
      'PAIEMENT_MARCHAND',
      'ACHAT_CREDIT',
      'PAIEMENT_FACTURES',
      'DEPOT_SIMPLE',
      'DEPOT_RETRAIT_SIMPLE',
      'RETRAIT_SIMPLE',
      'TRANSFERT_ARGENT',
      'BANQUE_WALLET',
      'WALLET_BANQUE',
      'EPARGNE',
      'CREDIT',
      'ASSURANCE',
      'AUTRES'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InstitutionType') THEN
    CREATE TYPE "public"."InstitutionType" AS ENUM (
      'ETABLISSEMENT_MONNAIE_ELECTRONIQUE',
      'PORTEFEUILLE_NUMERIQUE',
      'SERVICE_PAIEMENT_ELECTRONIQUE',
      'BANQUE_NUMERIQUE',
      'SERVICE_FINANCIER_DECENTRALISE',
      'SERVICE_FINANCEMENT_PARTICIPATIF',
      'SERVICE_INVESTISSEMENT',
      'SERVICE_GESTION_FINANCIERE',
      'SERVICE_ASSURANCE_NUMERIQUE'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Country') THEN
    CREATE TYPE "public"."Country" AS ENUM ('SENEGAL', 'CAMEROUN');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Thematic') THEN
    CREATE TYPE "public"."Thematic" AS ENUM (
      'FINANCIAL_EDUCATION',
      'PERSONAL_DEVELOPMENT',
      'FINANCIAL_LOAN',
      'BANK_CREDIT',
      'INVESTMENT',
      'BUDGET_MANAGEMENT',
      'SAVING',
      'ENTREPRENEURSHIP',
      'TAXATION',
      'INSURANCE'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ModuleStatus') THEN
    CREATE TYPE "public"."ModuleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DifficultyLevel') THEN
    CREATE TYPE "public"."DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');
  END IF;
END $$;





/* =========================
   TABLES
   ========================= */

CREATE TABLE IF NOT EXISTS "public"."User" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."Institution" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "website" TEXT,
  "geographicZones" TEXT[],
  "logoUrl" TEXT,
  "type" "public"."InstitutionType" NOT NULL DEFAULT 'ETABLISSEMENT_MONNAIE_ELECTRONIQUE',
  "pays" "public"."Country" NOT NULL DEFAULT 'SENEGAL',
  "status" "public"."InstitutionStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."Service" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "longName" TEXT NOT NULL,
  "type" "public"."TypeService" NOT NULL,
  "frais" JSONB NOT NULL,
  "conditionAccess" TEXT[],
  "plafonds" TEXT[],
  "infrastructureAccess" TEXT[],
  "montantMin" DOUBLE PRECISION,
  "montantMax" DOUBLE PRECISION,
  "institutionId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."Module" (
  "id" TEXT PRIMARY KEY,
  "title" VARCHAR(200) NOT NULL,
  "description" TEXT NOT NULL,
  "thematics" "public"."Thematic"[],
  "imageUrl" VARCHAR(500),
  "difficultyLevel" "public"."DifficultyLevel" NOT NULL,
  "estimatedDuration" DOUBLE PRECISION NOT NULL,
  "status" "public"."ModuleStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);





/* =========================
   INDEXES
   ========================= */

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key"
ON "public"."User" ("email");

CREATE UNIQUE INDEX IF NOT EXISTS "Institution_name_key"
ON "public"."Institution" ("name");

CREATE INDEX IF NOT EXISTS "Service_institutionId_idx"
ON "public"."Service" ("institutionId");

CREATE INDEX IF NOT EXISTS "Module_status_idx"
ON "public"."Module" ("status");

CREATE INDEX IF NOT EXISTS "Module_difficultyLevel_idx"
ON "public"."Module" ("difficultyLevel");

CREATE INDEX IF NOT EXISTS "Module_createdAt_idx"
ON "public"."Module" ("createdAt");





/* =========================
   FOREIGN KEY (SAFE)
   ========================= */

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'Service_institutionId_fkey'
  ) THEN
    ALTER TABLE "public"."Service"
    ADD CONSTRAINT "Service_institutionId_fkey"
    FOREIGN KEY ("institutionId")
    REFERENCES "public"."Institution" ("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE;
  END IF;
END $$;
