import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Update personal notes for a recipe
 */
export const updateRecipeNotes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const recipeId = parseInt(req.params.id);
    const { notes } = req.body;

    // Verify recipe belongs to user
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe || recipe.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.recipe.update({
      where: { id: recipeId },
      data: { userNotes: notes || null },
    });

    res.json({ data: updated });
  } catch (err) {
    console.error('Update notes error:', err);
    res.status(500).json({ error: err.message || 'Failed to update notes' });
  }
};

/**
 * Get recipe notes
 */
export const getRecipeNotes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const recipeId = parseInt(req.params.id);

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { userNotes: true, userId: true },
    });

    if (!recipe || recipe.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ data: { notes: recipe.userNotes } });
  } catch (err) {
    console.error('Get notes error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch notes' });
  }
};
