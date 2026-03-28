-- CreateEnum
CREATE TYPE "CustomDomainStatus" AS ENUM ('NONE', 'PENDING', 'DNS_VERIFIED', 'ACTIVE', 'FAILED', 'DISABLED');

-- CreateEnum
CREATE TYPE "CustomDomainSslStatus" AS ENUM ('NONE', 'PENDING', 'ISSUED', 'FAILED');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "customDomain" VARCHAR(255),
ADD COLUMN "customDomainStatus" "CustomDomainStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN "customDomainVerifiedAt" TIMESTAMP(3),
ADD COLUMN "customDomainSslStatus" "CustomDomainSslStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN "customDomainLastCheckedAt" TIMESTAMP(3),
ADD COLUMN "customDomainError" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Event_customDomain_key" ON "Event"("customDomain");
