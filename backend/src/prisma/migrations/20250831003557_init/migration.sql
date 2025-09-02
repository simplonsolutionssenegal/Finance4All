/*
  Warnings:

  - Made the column `lastLoginAt` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "lastLoginAt" SET NOT NULL,
ALTER COLUMN "lastLoginAt" SET DEFAULT CURRENT_TIMESTAMP;
