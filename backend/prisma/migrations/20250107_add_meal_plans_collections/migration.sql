-- Add imageUrl to Recipe
ALTER TABLE "Recipe" ADD COLUMN "imageUrl" TEXT;

-- Create MealPlan table
CREATE TABLE "MealPlan" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "recipeId" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MealPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
    CONSTRAINT "MealPlan_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE SET NULL,
    CONSTRAINT "MealPlan_userId_date_key" UNIQUE("userId", "date")
);

-- Create Collection table
CREATE TABLE "Collection" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- Create CollectionRecipe table
CREATE TABLE "CollectionRecipe" (
    "collectionId" INTEGER NOT NULL,
    "recipeId" INTEGER NOT NULL,
    CONSTRAINT "CollectionRecipe_pkey" PRIMARY KEY ("collectionId", "recipeId"),
    CONSTRAINT "CollectionRecipe_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE CASCADE,
    CONSTRAINT "CollectionRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX "MealPlan_userId_date_idx" ON "MealPlan"("userId", "date");
CREATE INDEX "MealPlan_recipeId_idx" ON "MealPlan"("recipeId");
CREATE INDEX "Collection_userId_idx" ON "Collection"("userId");
