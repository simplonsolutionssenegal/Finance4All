/*
  Warnings:

  - You are about to drop the column `zoneId` on the `InstitutionService` table. All the data in the column will be lost.
  - You are about to drop the `ZoneGeographique` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."InstitutionService" DROP CONSTRAINT "InstitutionService_zoneId_fkey";

-- DropIndex
DROP INDEX "public"."InstitutionService_zoneId_idx";

-- AlterTable
ALTER TABLE "public"."InstitutionService" DROP COLUMN "zoneId",
ADD COLUMN     "zones" TEXT[];

-- DropTable
DROP TABLE "public"."ZoneGeographique";
