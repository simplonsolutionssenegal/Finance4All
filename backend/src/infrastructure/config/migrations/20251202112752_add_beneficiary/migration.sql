-- CreateEnum
CREATE TYPE "public"."BeneficiaryStatus" AS ENUM ('ACTIVE', 'INACTIVE');

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

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiary_clerkUserId_key" ON "public"."Beneficiary"("clerkUserId");

-- CreateIndex
CREATE INDEX "Beneficiary_organizationId_idx" ON "public"."Beneficiary"("organizationId");

-- CreateIndex
CREATE INDEX "Beneficiary_status_idx" ON "public"."Beneficiary"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiary_organizationId_email_key" ON "public"."Beneficiary"("organizationId", "email");
