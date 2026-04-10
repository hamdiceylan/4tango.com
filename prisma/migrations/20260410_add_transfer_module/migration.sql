-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "TransferRequest" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "internalNote" TEXT,
    "accessToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransferRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferFormField" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "fieldType" "FieldType" NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "placeholder" TEXT,
    "helpText" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "options" JSONB,
    "validation" JSONB,
    "conditionalOn" JSONB,
    "labels" JSONB,
    "placeholders" JSONB,
    "helpTexts" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransferFormField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferFieldValue" (
    "id" TEXT NOT NULL,
    "transferRequestId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "TransferFieldValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransferRequest_accessToken_key" ON "TransferRequest"("accessToken");
CREATE INDEX "TransferRequest_eventId_idx" ON "TransferRequest"("eventId");
CREATE INDEX "TransferFormField_eventId_order_idx" ON "TransferFormField"("eventId", "order");
CREATE UNIQUE INDEX "TransferFieldValue_transferRequestId_fieldId_key" ON "TransferFieldValue"("transferRequestId", "fieldId");
CREATE INDEX "TransferFieldValue_transferRequestId_idx" ON "TransferFieldValue"("transferRequestId");

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TransferFormField" ADD CONSTRAINT "TransferFormField_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TransferFieldValue" ADD CONSTRAINT "TransferFieldValue_transferRequestId_fkey" FOREIGN KEY ("transferRequestId") REFERENCES "TransferRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
