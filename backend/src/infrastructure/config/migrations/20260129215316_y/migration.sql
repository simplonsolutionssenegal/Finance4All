-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('VIDEO', 'PDF', 'AUDIO');

-- CreateEnum
CREATE TYPE "public"."TranscodingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."StreamQuality" AS ENUM ('Q360P', 'Q480P', 'Q720P', 'Q1080P', 'AUDIO_LOW', 'AUDIO_MEDIUM', 'AUDIO_HIGH');

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
