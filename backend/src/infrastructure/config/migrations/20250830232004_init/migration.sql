-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIF', 'EN_ATTENTE', 'INACTIF', 'SUSPENDU');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIF';
