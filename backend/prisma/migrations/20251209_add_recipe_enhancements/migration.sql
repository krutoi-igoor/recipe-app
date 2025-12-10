-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN "rating" INTEGER,
ADD COLUMN "ratingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "userNotes" TEXT,
ADD COLUMN "sourceUrl" TEXT,
ADD COLUMN "sourceType" TEXT,
ADD COLUMN "difficulty" TEXT,
ADD COLUMN "imageUrl" TEXT;
