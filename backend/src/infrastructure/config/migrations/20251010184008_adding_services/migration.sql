-- CreateEnum
CREATE TYPE "public"."TypeService" AS ENUM ('PAIEMENT_MARCHAND', 'ACHAT_CREDIT', 'PAIEMENT_FACTURES', 'DEPOT_SIMPLE', 'DEPOT_RETRAIT_SIMPLE', 'RETRAIT_SIMPLE', 'TRANSFERT_ARGENT', 'BANQUE_WALLET', 'WALLET_BANQUE', 'EPARGNE', 'CREDIT', 'ASSURANCE', 'AUTRES');

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "longName" TEXT NOT NULL,
    "type" "public"."TypeService" NOT NULL,
    "frais" JSONB NOT NULL,
    "conditionAccess" TEXT[],
    "plafonds" TEXT[],
    "infrastructureAccess" TEXT[],
    "institutionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Service_institutionId_idx" ON "public"."Service"("institutionId");

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
