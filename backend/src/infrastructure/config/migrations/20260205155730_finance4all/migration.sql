-- CreateTable
CREATE TABLE "public"."QuizAttempt" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "earnedPoints" INTEGER NOT NULL,
    "totalPoints" INTEGER NOT NULL,
    "scorePercent" DOUBLE PRECISION NOT NULL,
    "isPassed" BOOLEAN NOT NULL,
    "answers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizAttempt_quizId_userId_idx" ON "public"."QuizAttempt"("quizId", "userId");

-- CreateIndex
CREATE INDEX "QuizAttempt_quizId_userId_isPassed_idx" ON "public"."QuizAttempt"("quizId", "userId", "isPassed");

-- CreateIndex
CREATE UNIQUE INDEX "QuizAttempt_quizId_userId_attemptNumber_key" ON "public"."QuizAttempt"("quizId", "userId", "attemptNumber");

-- AddForeignKey
ALTER TABLE "public"."QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
