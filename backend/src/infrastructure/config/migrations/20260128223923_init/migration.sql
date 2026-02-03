-- CreateEnum
CREATE TYPE "public"."BeneficiaryStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."InstitutionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."TypeService" AS ENUM ('PAIEMENT_MARCHAND', 'ACHAT_CREDIT', 'PAIEMENT_FACTURES', 'DEPOT_SIMPLE', 'DEPOT_RETRAIT_SIMPLE', 'RETRAIT_SIMPLE', 'TRANSFERT_ARGENT', 'BANQUE_WALLET', 'WALLET_BANQUE', 'EPARGNE', 'CREDIT', 'ASSURANCE', 'AUTRES');

-- CreateEnum
CREATE TYPE "public"."InstitutionType" AS ENUM ('ETABLISSEMENT_MONNAIE_ELECTRONIQUE', 'PORTEFEUILLE_NUMERIQUE', 'SERVICE_PAIEMENT_ELECTRONIQUE', 'BANQUE_NUMERIQUE', 'SERVICE_FINANCIER_DECENTRALISE', 'SERVICE_FINANCEMENT_PARTICIPATIF', 'SERVICE_INVESTISSEMENT', 'SERVICE_GESTION_FINANCIERE', 'SERVICE_ASSURANCE_NUMERIQUE');

-- CreateEnum
CREATE TYPE "public"."Country" AS ENUM ('SENEGAL', 'CAMEROUN');

-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('VIDEO', 'PDF', 'AUDIO', 'IMAGE');

-- CreateEnum
CREATE TYPE "public"."ModuleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Beneficiary" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" "public"."BeneficiaryStatus" NOT NULL DEFAULT 'ACTIVE',
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "website" TEXT,
    "geographicZones" TEXT[],
    "logoUrl" TEXT,
    "type" "public"."InstitutionType" NOT NULL DEFAULT 'ETABLISSEMENT_MONNAIE_ELECTRONIQUE',
    "pays" "public"."Country" NOT NULL DEFAULT 'SENEGAL',
    "status" "public"."InstitutionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" TEXT NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Module" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "thematics" VARCHAR(200) NOT NULL,
    "imageMediaId" TEXT,
    "difficultyLevel" "public"."DifficultyLevel" NOT NULL,
    "estimatedDuration" DOUBLE PRECISION NOT NULL,
    "status" "public"."ModuleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Media" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "type" "public"."MediaType" NOT NULL,
    "size" INTEGER NOT NULL,
    "bucket" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "metadata" JSONB,
    "isTemporary" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiary_clerkUserId_key" ON "public"."Beneficiary"("clerkUserId");

-- CreateIndex
CREATE INDEX "Beneficiary_organizationId_idx" ON "public"."Beneficiary"("organizationId");

-- CreateIndex
CREATE INDEX "Beneficiary_status_idx" ON "public"."Beneficiary"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiary_organizationId_email_key" ON "public"."Beneficiary"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_name_key" ON "public"."Institution"("name");

-- CreateIndex
CREATE INDEX "Service_institutionId_idx" ON "public"."Service"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Module_thematics_key" ON "public"."Module"("thematics");

-- CreateIndex
CREATE INDEX "Module_status_idx" ON "public"."Module"("status");

-- CreateIndex
CREATE INDEX "Module_difficultyLevel_idx" ON "public"."Module"("difficultyLevel");

-- CreateIndex
CREATE INDEX "Module_createdAt_idx" ON "public"."Module"("createdAt");

-- CreateIndex
CREATE INDEX "Media_type_idx" ON "public"."Media"("type");

-- CreateIndex
CREATE INDEX "Media_createdAt_idx" ON "public"."Media"("createdAt");

-- CreateIndex
CREATE INDEX "Media_isTemporary_expiresAt_idx" ON "public"."Media"("isTemporary", "expiresAt");

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Module" ADD CONSTRAINT "Module_imageMediaId_fkey" FOREIGN KEY ("imageMediaId") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
