/*
  Warnings:

  - Added the required column `address` to the `Organisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Organisation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Organisation" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;
