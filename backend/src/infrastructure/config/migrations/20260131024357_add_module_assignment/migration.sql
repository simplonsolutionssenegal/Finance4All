-- CreateEnum
CREATE TYPE "public"."AssignmentStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REMOVED');

-- CreateEnum
CREATE TYPE "public"."TranscodingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."StreamQuality" AS ENUM ('Q360P', 'Q480P', 'Q720P', 'Q1080P', 'AUDIO_LOW', 'AUDIO_MEDIUM', 'AUDIO_HIGH');

-- CreateTable
CREATE TABLE "public"."ModuleAssignment" (
    "id" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "status" "public"."AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "ModuleAssignment_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE INDEX "ModuleAssignment_beneficiaryId_idx" ON "public"."ModuleAssignment"("beneficiaryId");

-- CreateIndex
CREATE INDEX "ModuleAssignment_moduleId_idx" ON "public"."ModuleAssignment"("moduleId");

-- CreateIndex
CREATE INDEX "ModuleAssignment_status_idx" ON "public"."ModuleAssignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleAssignment_beneficiaryId_moduleId_key" ON "public"."ModuleAssignment"("beneficiaryId", "moduleId");

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

-- AddForeignKey
ALTER TABLE "public"."ModuleAssignment" ADD CONSTRAINT "ModuleAssignment_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "public"."Beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModuleAssignment" ADD CONSTRAINT "ModuleAssignment_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
