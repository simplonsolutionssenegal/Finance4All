-- CreateEnum
CREATE TYPE "public"."InstitutionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."TypeService" AS ENUM ('PAIEMENT_MARCHAND', 'ACHAT_CREDIT', 'PAIEMENT_FACTURES', 'DEPOT_SIMPLE', 'DEPOT_RETRAIT_SIMPLE', 'RETRAIT_SIMPLE', 'TRANSFERT_ARGENT', 'BANQUE_WALLET', 'WALLET_BANQUE', 'EPARGNE', 'CREDIT', 'ASSURANCE', 'AUTRES');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "website" TEXT,
    "geographicZones" TEXT[],
    "logoUrl" TEXT,
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
    "institutionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_name_key" ON "public"."Institution"("name");

-- CreateIndex
CREATE INDEX "Service_institutionId_idx" ON "public"."Service"("institutionId");

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
