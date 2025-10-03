-- CreateEnum
CREATE TYPE "public"."ProductType" AS ENUM ('CREDIT', 'EPARGNE', 'INVESTISSEMENT', 'ASSURANCE');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "type" "public"."ProductType" NOT NULL,
    "montantMinimum" INTEGER NOT NULL,
    "montantMaximum" INTEGER NOT NULL,
    "remboursement" JSONB NOT NULL,
    "conditionsEligibilite" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");
