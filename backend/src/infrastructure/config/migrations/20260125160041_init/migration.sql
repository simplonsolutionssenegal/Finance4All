-- CreateEnum
CREATE TYPE "public"."QuizStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "public"."Quiz" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
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
CREATE INDEX "Quiz_moduleId_idx" ON "public"."Quiz"("moduleId");

-- CreateIndex
CREATE INDEX "Quiz_status_idx" ON "public"."Quiz"("status");

-- AddForeignKey
ALTER TABLE "public"."Quiz" ADD CONSTRAINT "Quiz_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
