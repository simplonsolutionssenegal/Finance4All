/*
  Warnings:

  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_institutionId_fkey";

-- DropTable
DROP TABLE "public"."Product";

-- DropEnum
DROP TYPE "public"."ProductType";

-- DropEnum
DROP TYPE "public"."RemboursementMode";
