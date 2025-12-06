import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createMealPlan = async (req, res) => {
  try {
    const { date, recipeId, notes } = req.validatedData;
    const userId = req.user.id;

    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId,
        date: new Date(date),
        recipeId: recipeId || null,
        notes,
      },
      include: { recipe: true },
    });

    res.status(201).json({ success: true, data: mealPlan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMealPlans = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const where = { userId };
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const mealPlans = await prisma.mealPlan.findMany({
      where,
      include: { recipe: true },
      orderBy: { date: 'asc' },
    });

    res.json({ success: true, data: mealPlans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMealPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id: parseInt(id) },
      include: { recipe: true },
    });

    if (!mealPlan || mealPlan.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Meal plan not found' });
    }

    res.json({ success: true, data: mealPlan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateMealPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { date, recipeId, notes } = req.validatedData;

    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id: parseInt(id) },
    });

    if (!mealPlan || mealPlan.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Meal plan not found' });
    }

    const updated = await prisma.mealPlan.update({
      where: { id: parseInt(id) },
      data: {
        date: date ? new Date(date) : undefined,
        recipeId: recipeId || null,
        notes,
      },
      include: { recipe: true },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteMealPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id: parseInt(id) },
    });

    if (!mealPlan || mealPlan.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Meal plan not found' });
    }

    await prisma.mealPlan.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: 'Meal plan deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Shopping list aggregation
export const getShoppingList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const where = { userId };
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const mealPlans = await prisma.mealPlan.findMany({
      where,
      include: { recipe: true },
    });

    const aggregatedIngredients = {};

    mealPlans.forEach(plan => {
      if (plan.recipe) {
        const ingredients = JSON.parse(plan.recipe.ingredients || '[]');
        ingredients.forEach(ing => {
          const key = `${ing.name}|${ing.unit}`;
          if (aggregatedIngredients[key]) {
            aggregatedIngredients[key] += ing.quantity;
          } else {
            aggregatedIngredients[key] = ing.quantity;
          }
        });
      }
    });

    const shoppingList = Object.entries(aggregatedIngredients).map(([key, quantity]) => {
      const [name, unit] = key.split('|');
      return { name, quantity, unit };
    });

    res.json({ success: true, data: shoppingList });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
