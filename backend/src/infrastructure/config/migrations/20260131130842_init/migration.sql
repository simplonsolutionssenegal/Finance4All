-- CreateEnum
CREATE TYPE "public"."BeneficiaryStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."InstitutionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."TypeService" AS ENUM ('PAIEMENT_MARCHAND', 'ACHAT_CREDIT', 'PAIEMENT_FACTURES', 'DEPOT_SIMPLE', 'DEPOT_RETRAIT_SIMPLE', 'RETRAIT_SIMPLE', 'TRANSFERT_ARGENT', 'BANQUE_WALLET', 'WALLET_BANQUE', 'EPARGNE', 'CREDIT', 'ASSURANCE', 'AUTRES');

-- CreateEnum
CREATE TYPE "public"."InstitutionType" AS ENUM ('ETABLISSEMENT_MONNAIE_ELECTRONIQUE', 'PORTEFEUILLE_NUMERIQUE', 'SERVICE_PAIEMENT_ELECTRONIQUE', 'BANQUE_NUMERIQUE', 'SERVICE_FINANCIER_DECENTRALISE', 'SERVICE_FINANCEMENT_PARTICIPATIF', 'SERVICE_INVESTISSEMENT', 'SERVICE_GESTION_FINANCIERE', 'SERVICE_ASSURANCE_NUMERIQUE');

-- CreateEnum
CREATE TYPE "public"."Country" AS ENUM ('SENEGAL', 'CAMEROUN');

-- CreateEnum
CREATE TYPE "public"."Thematic" AS ENUM ('FINANCIAL_EDUCATION', 'PERSONAL_DEVELOPMENT', 'FINANCIAL_LOAN', 'BANK_CREDIT', 'INVESTMENT', 'BUDGET_MANAGEMENT', 'SAVING', 'ENTREPRENEURSHIP', 'TAXATION', 'INSURANCE');

-- CreateEnum
CREATE TYPE "public"."ModuleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('VIDEO', 'PDF', 'AUDIO');

-- CreateEnum
CREATE TYPE "public"."TranscodingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."StreamQuality" AS ENUM ('Q360P', 'Q480P', 'Q720P', 'Q1080P', 'AUDIO_LOW', 'AUDIO_MEDIUM', 'AUDIO_HIGH');

-- CreateEnum
CREATE TYPE "public"."LessonStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "public"."QuizStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Beneficiary" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" "public"."BeneficiaryStatus" NOT NULL DEFAULT 'ACTIVE',
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "website" TEXT,
    "geographicZones" TEXT[],
    "logoUrl" TEXT,
    "type" "public"."InstitutionType" NOT NULL DEFAULT 'ETABLISSEMENT_MONNAIE_ELECTRONIQUE',
    "pays" "public"."Country" NOT NULL DEFAULT 'SENEGAL',
    "status" "public"."InstitutionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

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
    "montantMin" DOUBLE PRECISION,
    "montantMax" DOUBLE PRECISION,
    "institutionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Module" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "thematics" "public"."Thematic"[],
    "imageUrl" VARCHAR(500),
    "difficultyLevel" "public"."DifficultyLevel" NOT NULL,
    "estimatedDuration" DOUBLE PRECISION NOT NULL,
    "status" "public"."ModuleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Media" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "type" "public"."MediaType" NOT NULL,
    "size" INTEGER NOT NULL,
    "bucket" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "metadata" JSONB,
    "isTemporary" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HlsVariant" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "quality" "public"."StreamQuality" NOT NULL,
    "bandwidth" INTEGER NOT NULL,
    "resolution" TEXT,
    "codecs" TEXT NOT NULL,
    "playlistPath" TEXT NOT NULL,
    "segmentPrefix" TEXT NOT NULL,
    "segmentCount" INTEGER NOT NULL DEFAULT 0,
    "segmentDuration" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HlsVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TranscodingJob" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "status" "public"."TranscodingStatus" NOT NULL DEFAULT 'PENDING',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranscodingJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MediaProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "currentPosition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "duration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "lastWatchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StreamToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreamToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Lesson" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."LessonStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Chapter" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "mediaId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Quiz" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT,
    "lessonId" TEXT,
    "chapterId" TEXT,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."QuizStatus" NOT NULL DEFAULT 'DRAFT',
    "scoreMinimum" INTEGER NOT NULL DEFAULT 0,
    "duree" INTEGER,
    "nombreTentatives" SMALLINT NOT NULL DEFAULT 3,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiary_clerkUserId_key" ON "public"."Beneficiary"("clerkUserId");

-- CreateIndex
CREATE INDEX "Beneficiary_organizationId_idx" ON "public"."Beneficiary"("organizationId");

-- CreateIndex
CREATE INDEX "Beneficiary_status_idx" ON "public"."Beneficiary"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiary_organizationId_email_key" ON "public"."Beneficiary"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_name_key" ON "public"."Institution"("name");

-- CreateIndex
CREATE INDEX "Service_institutionId_idx" ON "public"."Service"("institutionId");

-- CreateIndex
CREATE INDEX "Module_status_idx" ON "public"."Module"("status");

-- CreateIndex
CREATE INDEX "Module_difficultyLevel_idx" ON "public"."Module"("difficultyLevel");

-- CreateIndex
CREATE INDEX "Module_createdAt_idx" ON "public"."Module"("createdAt");

-- CreateIndex
CREATE INDEX "Media_type_idx" ON "public"."Media"("type");

-- CreateIndex
CREATE INDEX "Media_createdAt_idx" ON "public"."Media"("createdAt");

-- CreateIndex
CREATE INDEX "Media_isTemporary_expiresAt_idx" ON "public"."Media"("isTemporary", "expiresAt");

-- CreateIndex
CREATE INDEX "HlsVariant_mediaId_idx" ON "public"."HlsVariant"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "HlsVariant_mediaId_quality_key" ON "public"."HlsVariant"("mediaId", "quality");

-- CreateIndex
CREATE UNIQUE INDEX "TranscodingJob_mediaId_key" ON "public"."TranscodingJob"("mediaId");

-- CreateIndex
CREATE INDEX "TranscodingJob_status_idx" ON "public"."TranscodingJob"("status");

-- CreateIndex
CREATE INDEX "TranscodingJob_mediaId_idx" ON "public"."TranscodingJob"("mediaId");

-- CreateIndex
CREATE INDEX "MediaProgress_userId_idx" ON "public"."MediaProgress"("userId");

-- CreateIndex
CREATE INDEX "MediaProgress_mediaId_idx" ON "public"."MediaProgress"("mediaId");

-- CreateIndex
CREATE INDEX "MediaProgress_userId_lastWatchedAt_idx" ON "public"."MediaProgress"("userId", "lastWatchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MediaProgress_userId_mediaId_key" ON "public"."MediaProgress"("userId", "mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "StreamToken_token_key" ON "public"."StreamToken"("token");

-- CreateIndex
CREATE INDEX "StreamToken_token_idx" ON "public"."StreamToken"("token");

-- CreateIndex
CREATE INDEX "StreamToken_mediaId_userId_idx" ON "public"."StreamToken"("mediaId", "userId");

-- CreateIndex
CREATE INDEX "StreamToken_expiresAt_idx" ON "public"."StreamToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Lesson_moduleId_idx" ON "public"."Lesson"("moduleId");

-- CreateIndex
CREATE INDEX "Lesson_status_idx" ON "public"."Lesson"("status");

-- CreateIndex
CREATE INDEX "Lesson_order_idx" ON "public"."Lesson"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_mediaId_key" ON "public"."Chapter"("mediaId");

-- CreateIndex
CREATE INDEX "Chapter_lessonId_idx" ON "public"."Chapter"("lessonId");

-- CreateIndex
CREATE INDEX "Chapter_order_idx" ON "public"."Chapter"("order");

-- CreateIndex
CREATE INDEX "Chapter_mediaId_idx" ON "public"."Chapter"("mediaId");

-- CreateIndex
CREATE INDEX "Quiz_moduleId_idx" ON "public"."Quiz"("moduleId");

-- CreateIndex
CREATE INDEX "Quiz_lessonId_idx" ON "public"."Quiz"("lessonId");

-- CreateIndex
CREATE INDEX "Quiz_chapterId_idx" ON "public"."Quiz"("chapterId");

-- CreateIndex
CREATE INDEX "Quiz_status_idx" ON "public"."Quiz"("status");

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "public"."Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chapter" ADD CONSTRAINT "Chapter_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chapter" ADD CONSTRAINT "Chapter_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quiz" ADD CONSTRAINT "Quiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quiz" ADD CONSTRAINT "Quiz_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quiz" ADD CONSTRAINT "Quiz_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
