/*
  Warnings:

  - You are about to alter the column `montantMin` on the `Service` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `montantMax` on the `Service` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "public"."Service" ALTER COLUMN "montantMin" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "montantMax" SET DATA TYPE DOUBLE PRECISION;
