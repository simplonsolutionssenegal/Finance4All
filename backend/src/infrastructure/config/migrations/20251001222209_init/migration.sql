-- CreateEnum
CREATE TYPE "public"."InstitutionServiceType" AS ENUM ('CREDIT', 'EPARGNE', 'MOBILE_MONEY');

-- CreateEnum
CREATE TYPE "public"."RemboursementMode" AS ENUM ('AGENCE', 'USSD', 'MOBILE');

-- CreateTable
CREATE TABLE "public"."Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ZoneGeographique" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZoneGeographique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InstitutionZone" (
    "institutionId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "InstitutionZone_pkey" PRIMARY KEY ("institutionId","zoneId")
);

-- CreateTable
CREATE TABLE "public"."InstitutionService" (
    "id" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "montantMin" DECIMAL(18,2) NOT NULL,
    "montantMax" DECIMAL(18,2) NOT NULL,
    "type" "public"."InstitutionServiceType" NOT NULL,
    "modesRemboursement" "public"."RemboursementMode" NOT NULL,
    "institutionId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Institution_name_key" ON "public"."Institution"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ZoneGeographique_name_key" ON "public"."ZoneGeographique"("name");

-- CreateIndex
CREATE INDEX "InstitutionZone_zoneId_idx" ON "public"."InstitutionZone"("zoneId");

-- CreateIndex
CREATE INDEX "InstitutionService_institutionId_idx" ON "public"."InstitutionService"("institutionId");

-- CreateIndex
CREATE INDEX "InstitutionService_zoneId_idx" ON "public"."InstitutionService"("zoneId");

-- AddForeignKey
ALTER TABLE "public"."InstitutionZone" ADD CONSTRAINT "InstitutionZone_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InstitutionZone" ADD CONSTRAINT "InstitutionZone_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "public"."ZoneGeographique"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InstitutionService" ADD CONSTRAINT "InstitutionService_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InstitutionService" ADD CONSTRAINT "InstitutionService_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "public"."ZoneGeographique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
