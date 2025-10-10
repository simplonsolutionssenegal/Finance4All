-- CreateEnum
CREATE TYPE "public"."InstitutionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."ProductType" AS ENUM ('CREDIT', 'EPARGNE', 'MOBILE_MONEY', 'INVESTISSEMENT', 'ASSURANCE');

-- CreateEnum
CREATE TYPE "public"."RemboursementMode" AS ENUM ('AGENCE', 'USSD', 'MOBILE');

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
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "montantMin" DECIMAL(18,2) NOT NULL,
    "montantMax" DECIMAL(18,2) NOT NULL,
    "type" "public"."ProductType" NOT NULL,
    "modesRemboursement" "public"."RemboursementMode" NOT NULL,
    "institutionId" TEXT NOT NULL,
    "zones" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_name_key" ON "public"."Institution"("name");

-- CreateIndex
CREATE INDEX "Product_institutionId_idx" ON "public"."Product"("institutionId");

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
