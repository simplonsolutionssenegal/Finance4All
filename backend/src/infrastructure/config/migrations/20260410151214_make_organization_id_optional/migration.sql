/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Beneficiary` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Beneficiary_organizationId_email_key";

-- AlterTable
ALTER TABLE "public"."Beneficiary" ALTER COLUMN "organizationId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiary_email_key" ON "public"."Beneficiary"("email");
