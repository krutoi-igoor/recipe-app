import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Add or update a rating for a recipe (1-5 stars)
 */
export const rateRecipe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const recipeId = parseInt(req.params.id);
    const { score } = req.body;

    // Validate score
    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ error: 'Score must be between 1 and 5' });
    }

    // Check recipe exists and belongs to user or is public
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Create or update rating
    const rating = await prisma.rating.upsert({
      where: { userId_recipeId: { userId, recipeId } },
      update: { score },
      create: { userId, recipeId, score },
    });

    // Recalculate average rating for recipe
    const allRatings = await prisma.rating.findMany({
      where: { recipeId },
    });

    const avgRating = allRatings.length > 0
      ? Math.round((allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length) * 10) / 10
      : null;

    // Update recipe with average rating
    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        rating: avgRating ? Math.round(avgRating) : null,
        ratingCount: allRatings.length,
      },
    });

    res.json({
      data: {
        rating: updatedRecipe,
        userRating: rating,
        averageRating: avgRating,
        totalRatings: allRatings.length,
      },
    });
  } catch (err) {
    console.error('Rate recipe error:', err);
    res.status(500).json({ error: err.message || 'Failed to rate recipe' });
  }
};

/**
 * Get rating statistics for a recipe
 */
export const getRecipeRatings = async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);

    const ratings = await prisma.rating.findMany({
      where: { recipeId },
      select: { score: true },
    });

    if (ratings.length === 0) {
      return res.json({
        data: {
          averageRating: null,
          totalRatings: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      });
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(r => distribution[r.score]++);

    const avgRating = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;

    res.json({
      data: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalRatings: ratings.length,
        distribution,
      },
    });
  } catch (err) {
    console.error('Get ratings error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch ratings' });
  }
};

/**
 * Get user's rating for a recipe
 */
export const getUserRating = async (req, res) => {
  try {
    const userId = req.user.userId;
    const recipeId = parseInt(req.params.id);

    const rating = await prisma.rating.findUnique({
      where: { userId_recipeId: { userId, recipeId } },
    });

    res.json({ data: rating });
  } catch (err) {
    console.error('Get user rating error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch rating' });
  }
};

/**
 * Delete user's rating for a recipe
 */
export const deleteRating = async (req, res) => {
  try {
    const userId = req.user.userId;
    const recipeId = parseInt(req.params.id);

    await prisma.rating.delete({
      where: { userId_recipeId: { userId, recipeId } },
    });

    // Recalculate average rating
    const allRatings = await prisma.rating.findMany({
      where: { recipeId },
    });

    const avgRating = allRatings.length > 0
      ? Math.round((allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length) * 10) / 10
      : null;

    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        rating: avgRating ? Math.round(avgRating) : null,
        ratingCount: allRatings.length,
      },
    });

    res.json({ data: updatedRecipe });
  } catch (err) {
    console.error('Delete rating error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete rating' });
  }
};
