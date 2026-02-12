-- CreateTable
CREATE TABLE "public"."ModuleEnrollment" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModuleEnrollment_moduleId_userId_key" ON "public"."ModuleEnrollment"("moduleId", "userId");

-- CreateIndex
CREATE INDEX "ModuleEnrollment_moduleId_idx" ON "public"."ModuleEnrollment"("moduleId");

-- CreateIndex
CREATE INDEX "ModuleEnrollment_userId_idx" ON "public"."ModuleEnrollment"("userId");

-- AddForeignKey
ALTER TABLE "public"."ModuleEnrollment" ADD CONSTRAINT "ModuleEnrollment_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
