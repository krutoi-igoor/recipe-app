import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createRecipe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, ingredients, instructions, servings, prepTime, cookTime, tags } =
      req.validatedData;

    const recipe = await prisma.recipe.create({
      data: {
        userId,
        title,
        description,
        ingredients: JSON.stringify(ingredients),
        instructions: JSON.stringify(instructions),
        servings,
        prepTime,
        cookTime,
        tags: tags ? JSON.stringify(tags) : null,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients),
        instructions: JSON.parse(recipe.instructions),
        tags: recipe.tags ? JSON.parse(recipe.tags) : [],
      },
    });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ success: false, error: 'Failed to create recipe' });
  }
};

export const getRecipes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, offset = 0 } = req.query;

    const recipes = await prisma.recipe.findMany({
      where: { userId },
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.recipe.count({ where: { userId } });

    res.status(200).json({
      success: true,
      data: {
        recipes: recipes.map((r) => ({
          ...r,
          ingredients: JSON.parse(r.ingredients),
          instructions: JSON.parse(r.instructions),
          tags: r.tags ? JSON.parse(r.tags) : [],
        })),
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recipes' });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const recipe = await prisma.recipe.findUnique({
      where: { id: parseInt(id) },
    });

    if (!recipe || recipe.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients),
        instructions: JSON.parse(recipe.instructions),
        tags: recipe.tags ? JSON.parse(recipe.tags) : [],
      },
    });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recipe' });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { title, description, ingredients, instructions, servings, prepTime, cookTime, tags } =
      req.validatedData;

    // Verify ownership
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingRecipe || existingRecipe.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }

    const recipe = await prisma.recipe.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        ingredients: JSON.stringify(ingredients),
        instructions: JSON.stringify(instructions),
        servings,
        prepTime,
        cookTime,
        tags: tags ? JSON.stringify(tags) : null,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      data: {
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients),
        instructions: JSON.parse(recipe.instructions),
        tags: recipe.tags ? JSON.parse(recipe.tags) : [],
      },
    });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ success: false, error: 'Failed to update recipe' });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Verify ownership
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingRecipe || existingRecipe.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }

    await prisma.recipe.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ success: true, message: 'Recipe deleted' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete recipe' });
  }
};
