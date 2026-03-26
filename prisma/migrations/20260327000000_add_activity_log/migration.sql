-- CreateEnum
CREATE TYPE "ActivityCategory" AS ENUM ('REGISTRATION', 'PAYMENT', 'COMMUNICATION', 'TEAM', 'EVENT', 'SETTINGS');

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorEmail" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "category" "ActivityCategory" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityLabel" TEXT,
    "changes" JSONB,
    "metadata" JSONB,
    "eventId" TEXT,
    "registrationId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLog_organizerId_createdAt_idx" ON "ActivityLog"("organizerId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_organizerId_action_idx" ON "ActivityLog"("organizerId", "action");

-- CreateIndex
CREATE INDEX "ActivityLog_organizerId_entityType_entityId_idx" ON "ActivityLog"("organizerId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "ActivityLog_organizerId_actorId_idx" ON "ActivityLog"("organizerId", "actorId");

-- CreateIndex
CREATE INDEX "ActivityLog_eventId_idx" ON "ActivityLog"("eventId");

-- CreateIndex
CREATE INDEX "ActivityLog_registrationId_idx" ON "ActivityLog"("registrationId");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
