import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Update recipe difficulty
 */
export const updateDifficulty = async (req, res) => {
  try {
    const userId = req.user.userId;
    const recipeId = parseInt(req.params.id);
    const { difficulty } = req.body;

    const validDifficulties = ['easy', 'medium', 'hard'];
    if (difficulty && !validDifficulties.includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }

    // Verify recipe ownership
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe || recipe.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.recipe.update({
      where: { id: recipeId },
      data: { difficulty: difficulty || null },
    });

    res.json({ data: updated });
  } catch (err) {
    console.error('Update difficulty error:', err);
    res.status(500).json({ error: err.message || 'Failed to update difficulty' });
  }
};

/**
 * Update recipe source info
 */
export const updateRecipeSource = async (req, res) => {
  try {
    const userId = req.user.userId;
    const recipeId = parseInt(req.params.id);
    const { sourceUrl, sourceType } = req.body;

    // Verify recipe ownership
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe || recipe.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        sourceUrl: sourceUrl || null,
        sourceType: sourceType || null,
      },
    });

    res.json({ data: updated });
  } catch (err) {
    console.error('Update source error:', err);
    res.status(500).json({ error: err.message || 'Failed to update source' });
  }
};

/**
 * Filter recipes by difficulty
 */
export const recipesByDifficulty = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { difficulty } = req.query;

    if (!difficulty) {
      return res.status(400).json({ error: 'Difficulty is required' });
    }

    const recipes = await prisma.recipe.findMany({
      where: { userId, difficulty },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: recipes });
  } catch (err) {
    console.error('Get by difficulty error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch recipes' });
  }
};

/**
 * Get recipes by source type
 */
export const recipesBySource = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sourceType } = req.query;

    if (!sourceType) {
      return res.status(400).json({ error: 'Source type is required' });
    }

    const recipes = await prisma.recipe.findMany({
      where: { userId, sourceType },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: recipes });
  } catch (err) {
    console.error('Get by source error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch recipes' });
  }
};

/**
 * Auto-detect difficulty based on recipe complexity
 */
export const autoDetectDifficulty = async (req, res) => {
  try {
    const userId = req.user.userId;
    const recipeId = parseInt(req.params.id);

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe || recipe.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Parse ingredients and instructions
    let ingredientCount = 0;
    let instructionCount = 0;

    try {
      const ingredients = JSON.parse(recipe.ingredients || '[]');
      ingredientCount = Array.isArray(ingredients) ? ingredients.length : 0;
    } catch {}

    try {
      const instructions = JSON.parse(recipe.instructions || '[]');
      instructionCount = Array.isArray(instructions) ? instructions.length : 0;
    } catch {}

    // Simple heuristic: detect difficulty based on ingredient/instruction count
    let difficulty = 'easy';
    if (ingredientCount > 15 || instructionCount > 10) {
      difficulty = 'hard';
    } else if (ingredientCount > 8 || instructionCount > 5) {
      difficulty = 'medium';
    }

    const updated = await prisma.recipe.update({
      where: { id: recipeId },
      data: { difficulty },
    });

    res.json({ data: updated, detected: difficulty });
  } catch (err) {
    console.error('Auto-detect difficulty error:', err);
    res.status(500).json({ error: err.message || 'Failed to detect difficulty' });
  }
};
