/*
  Warnings:

  - A unique constraint covering the columns `[clerkUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "clerkUserId" VARCHAR(128),
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "public"."User"("clerkUserId");
