-- Fix failed migration state and apply the enhancement columns
-- This script should be run directly on the database before running prisma migrate deploy

-- Step 1: Mark the failed migration as rolled back
UPDATE "_prisma_migrations" 
SET rolled_back_at = NOW(), 
    finished_at = NULL 
WHERE migration_name = '20251209_add_recipe_enhancements' 
  AND rolled_back_at IS NULL;

-- Step 2: Add the missing columns (using IF NOT EXISTS for safety)
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "rating" INTEGER;
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "ratingCount" INTEGER DEFAULT 0;
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "userNotes" TEXT;
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT;
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "sourceType" TEXT;
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "difficulty" TEXT;

-- Step 3: Update any existing records to have ratingCount = 0 if NULL
UPDATE "Recipe" SET "ratingCount" = 0 WHERE "ratingCount" IS NULL;

-- Step 4: Make ratingCount NOT NULL
ALTER TABLE "Recipe" ALTER COLUMN "ratingCount" SET NOT NULL;

-- Step 5: Record the migration as successfully applied
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES (
  gen_random_uuid(),
  '0', -- checksum doesn't matter for manual migrations
  NOW(),
  '20251209_add_recipe_enhancements',
  NULL,
  NULL,
  NOW(),
  1
) ON CONFLICT DO NOTHING;

-- Step 6: Also record the reset migration
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES (
  gen_random_uuid(),
  '0',
  NOW(),
  '20251209_reset_failed_migration',
  NULL,
  NULL,
  NOW(),
  1
) ON CONFLICT DO NOTHING;
