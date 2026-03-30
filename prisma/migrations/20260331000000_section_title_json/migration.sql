-- AlterTable: Change title from String to JSON for localization support
-- First, create a temporary column to preserve any existing data
ALTER TABLE "EventPageSection" ADD COLUMN "title_new" JSONB;

-- Convert existing string titles to JSON format (as simple strings which JSON supports)
UPDATE "EventPageSection" SET "title_new" = to_jsonb("title") WHERE "title" IS NOT NULL;

-- Drop the old column
ALTER TABLE "EventPageSection" DROP COLUMN "title";

-- Rename the new column
ALTER TABLE "EventPageSection" RENAME COLUMN "title_new" TO "title";
