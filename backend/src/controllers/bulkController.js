import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Add multiple recipes to a collection
 */
export const addRecipesToCollection = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { collectionId, recipeIds } = req.body;

    if (!collectionId || !Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res.status(400).json({ error: 'Collection ID and recipe IDs are required' });
    }

    // Verify collection ownership
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection || collection.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Verify all recipes belong to user
    const recipes = await prisma.recipe.findMany({
      where: { id: { in: recipeIds }, userId },
    });

    if (recipes.length !== recipeIds.length) {
      return res.status(403).json({ error: 'Some recipes are not accessible' });
    }

    // Add recipes to collection
    const added = [];
    for (const recipeId of recipeIds) {
      try {
        await prisma.collectionRecipe.create({
          data: { collectionId, recipeId },
        });
        added.push(recipeId);
      } catch {
        // Recipe might already be in collection, skip
      }
    }

    res.json({ data: { added: added.length, total: recipeIds.length } });
  } catch (err) {
    console.error('Bulk add to collection error:', err);
    res.status(500).json({ error: err.message || 'Failed to add recipes' });
  }
};

/**
 * Bulk delete recipes
 */
export const bulkDeleteRecipes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { recipeIds } = req.body;

    if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res.status(400).json({ error: 'Recipe IDs are required' });
    }

    // Verify all recipes belong to user
    const recipes = await prisma.recipe.findMany({
      where: { id: { in: recipeIds }, userId },
    });

    if (recipes.length !== recipeIds.length) {
      return res.status(403).json({ error: 'Some recipes are not accessible' });
    }

    // Delete recipes (cascade deletes handle related records)
    const result = await prisma.recipe.deleteMany({
      where: { id: { in: recipeIds }, userId },
    });

    res.json({ data: { deleted: result.count } });
  } catch (err) {
    console.error('Bulk delete error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete recipes' });
  }
};

/**
 * Bulk export recipes
 */
export const bulkExportRecipes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { recipeIds } = req.body;

    if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res.status(400).json({ error: 'Recipe IDs are required' });
    }

    // Fetch recipes
    const recipes = await prisma.recipe.findMany({
      where: { id: { in: recipeIds }, userId },
    });

    // Parse JSON fields
    const parsed = recipes.map(r => ({
      ...r,
      ingredients: JSON.parse(r.ingredients || '[]'),
      instructions: JSON.parse(r.instructions || '[]'),
      tags: r.tags ? (Array.isArray(JSON.parse(r.tags)) ? JSON.parse(r.tags) : r.tags.split(',')) : [],
    }));

    res.json({ data: parsed });
  } catch (err) {
    console.error('Bulk export error:', err);
    res.status(500).json({ error: err.message || 'Failed to export recipes' });
  }
};
