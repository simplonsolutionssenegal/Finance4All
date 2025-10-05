/*
  Warnings:

  - You are about to drop the `InstitutionZone` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `avatar` to the `Institution` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."InstitutionZone" DROP CONSTRAINT "InstitutionZone_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."InstitutionZone" DROP CONSTRAINT "InstitutionZone_zoneId_fkey";

-- AlterTable
ALTER TABLE "public"."Institution" ADD COLUMN     "avatar" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."InstitutionZone";
