import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Clone (duplicate) a recipe
 */
export const cloneRecipe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const recipeId = parseInt(req.params.id);

    // Fetch original recipe
    const original = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!original) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Create clone with "(Copy)" suffix
    const cloned = await prisma.recipe.create({
      data: {
        userId,
        title: `${original.title} (Copy)`,
        description: original.description,
        ingredients: original.ingredients,
        instructions: original.instructions,
        servings: original.servings,
        prepTime: original.prepTime,
        cookTime: original.cookTime,
        tags: original.tags,
        imageUrl: original.imageUrl,
        difficulty: original.difficulty,
        // Don't clone rating, notes, or source
      },
    });

    res.status(201).json({ data: cloned });
  } catch (err) {
    console.error('Clone recipe error:', err);
    res.status(500).json({ error: err.message || 'Failed to clone recipe' });
  }
};
