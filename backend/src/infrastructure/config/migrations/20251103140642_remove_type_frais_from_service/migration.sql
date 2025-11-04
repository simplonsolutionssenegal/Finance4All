/*
  Warnings:

  - You are about to drop the column `typeFrais` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Service" DROP COLUMN "typeFrais";

-- DropEnum
DROP TYPE "public"."TypeCalculation";
