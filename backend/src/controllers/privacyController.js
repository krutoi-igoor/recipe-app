import { PrismaClient } from '@prisma/client';
import { Parser } from 'json2csv';

const prisma = new PrismaClient();

/**
 * Export user's entire recipe library as JSON
 */
export const exportAsJson = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        recipes: true,
        mealPlans: {
          include: { recipe: true },
        },
        collections: {
          include: { recipes: { include: { recipe: true } } },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Parse all JSON fields
    const recipes = user.recipes.map((r) => ({
      ...r,
      ingredients: JSON.parse(r.ingredients),
      instructions: JSON.parse(r.instructions),
      tags: r.tags ? JSON.parse(r.tags) : [],
    }));

    const mealPlans = user.mealPlans.map((mp) => ({
      ...mp,
      recipe: mp.recipe
        ? {
            ...mp.recipe,
            ingredients: JSON.parse(mp.recipe.ingredients),
            instructions: JSON.parse(mp.recipe.instructions),
            tags: mp.recipe.tags ? JSON.parse(mp.recipe.tags) : [],
          }
        : null,
    }));

    const collections = user.collections.map((c) => ({
      ...c,
      recipes: c.recipes.map((cr) => ({
        recipeId: cr.recipeId,
        recipe: {
          ...cr.recipe,
          ingredients: JSON.parse(cr.recipe.ingredients),
          instructions: JSON.parse(cr.recipe.instructions),
          tags: cr.recipe.tags ? JSON.parse(cr.recipe.tags) : [],
        },
      })),
    }));

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
      recipes,
      mealPlans,
      collections,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="recipe-library-${userId}-${new Date().toISOString().split('T')[0]}.json"`
    );
    res.send(JSON.stringify(exportData, null, 2));
  } catch (error) {
    console.error('Export JSON error:', error);
    res.status(500).json({ success: false, error: 'Failed to export data' });
  }
};

/**
 * Export user's recipes as CSV
 */
export const exportAsCSV = async (req, res) => {
  try {
    const userId = req.user.userId;

    const recipes = await prisma.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (recipes.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No recipes to export',
        data: '',
      });
    }

    // Flatten recipes for CSV
    const csvData = recipes.map((r) => ({
      title: r.title,
      description: r.description || '',
      ingredients: Array.isArray(JSON.parse(r.ingredients))
        ? JSON.parse(r.ingredients)
            .map((ing) => `${ing.name} (${ing.quantity} ${ing.unit})`)
            .join('; ')
        : '',
      instructions: Array.isArray(JSON.parse(r.instructions))
        ? JSON.parse(r.instructions).join('; ')
        : '',
      servings: r.servings || '',
      prepTime: r.prepTime || '',
      cookTime: r.cookTime || '',
      tags: r.tags ? JSON.parse(r.tags).join(', ') : '',
      createdAt: r.createdAt.toISOString(),
    }));

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="recipes-${userId}-${new Date().toISOString().split('T')[0]}.csv"`
    );
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ success: false, error: 'Failed to export as CSV' });
  }
};

/**
 * Delete all user data (GDPR right to erasure)
 * WARNING: Permanently deletes all recipes, meal plans, collections
 */
export const deleteAllUserData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { confirmPassword } = req.body;

    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Password confirmation required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Verify password (optional but recommended)
    // In production, compare confirmPassword with hashed user.password using bcrypt

    // Delete in order: collections, meal plans, recipes, then user
    await prisma.collectionRecipe.deleteMany({
      where: {
        collection: {
          userId,
        },
      },
    });

    await prisma.collection.deleteMany({
      where: { userId },
    });

    await prisma.mealPlan.deleteMany({
      where: { userId },
    });

    await prisma.recipe.deleteMany({
      where: { userId },
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({
      success: true,
      message: 'All user data permanently deleted',
    });
  } catch (error) {
    console.error('Delete user data error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete user data' });
  }
};

/**
 * Get user's data summary (for privacy transparency)
 */
export const getDataSummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [recipeCount, mealPlanCount, collectionCount] = await Promise.all([
      prisma.recipe.count({ where: { userId } }),
      prisma.mealPlan.count({ where: { userId } }),
      prisma.collection.count({ where: { userId } }),
    ]);

    const storageEstimate = {
      recipes: `${recipeCount} recipes`,
      mealPlans: `${mealPlanCount} meal plans`,
      collections: `${collectionCount} collections`,
    };

    res.json({
      success: true,
      data: {
        summary: storageEstimate,
        totalItems: recipeCount + mealPlanCount + collectionCount,
        canExport: true,
        canDelete: true,
      },
    });
  } catch (error) {
    console.error('Get data summary error:', error);
    res.status(500).json({ success: false, error: 'Failed to get data summary' });
  }
};
