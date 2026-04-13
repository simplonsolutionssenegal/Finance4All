-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('HOMME', 'FEMME');

-- AlterTable
ALTER TABLE "public"."Beneficiary" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "gender" "public"."Gender";
