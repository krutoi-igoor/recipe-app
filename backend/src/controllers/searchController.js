import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Advanced recipe search with filters
 * Supports: keyword, tags, meal type, dietary, cuisine, prep time, cook time
 */
export const searchRecipes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      q = '', // keyword search
      tags = [], // filter by tags (array)
      mealType = '', // breakfast, lunch, dinner, snack, dessert
      dietary = '', // vegan, vegetarian, gluten-free, dairy-free, etc.
      cuisine = '', // italian, asian, mexican, etc.
      maxPrepTime = null, // max prep time in minutes
      maxCookTime = null, // max cook time in minutes
      limit = 20,
      offset = 0,
    } = req.query;

    const where = { userId };
    const parsedTags = Array.isArray(tags) ? tags : (tags ? [tags] : []);

    // Keyword search across title and description
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Tag filtering: recipe must contain ALL specified tags (case-insensitive JSON search)
    if (parsedTags.length > 0) {
      const tagQueries = parsedTags.map((tag) => ({
        tags: { contains: `"${tag}"`, mode: 'insensitive' },
      }));
      where.AND = tagQueries;
    }

    // Meal type, dietary, cuisine filtering via tags
    if (mealType) {
      where.tags = { contains: `"${mealType}"` };
    }
    if (dietary) {
      where.tags = { contains: `"${dietary}"` };
    }
    if (cuisine) {
      where.tags = { contains: `"${cuisine}"` };
    }

    const recipes = await prisma.recipe.findMany({
      where,
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.recipe.count({ where });

    // Parse recipes
    const parsed = recipes.map((r) => ({
      ...r,
      ingredients: JSON.parse(r.ingredients),
      instructions: JSON.parse(r.instructions),
      tags: r.tags ? JSON.parse(r.tags) : [],
    }));

    res.json({
      success: true,
      data: {
        recipes: parsed,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        filters: {
          keyword: q,
          tags: parsedTags,
          mealType,
          dietary,
          cuisine,
          maxPrepTime,
          maxCookTime,
        },
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, error: 'Search failed' });
  }
};

/**
 * Get available tags and filters for UI dropdown/filter suggestions
 */
export const getFilterOptions = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Collect all unique tags from user's recipes
    const recipes = await prisma.recipe.findMany({
      where: { userId },
      select: { tags: true },
    });

    const allTags = new Set();
    recipes.forEach((r) => {
      if (r.tags) {
        const parsed = JSON.parse(r.tags);
        if (Array.isArray(parsed)) {
          parsed.forEach((tag) => allTags.add(tag));
        }
      }
    });

    // Predefined filter options
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
    const dietaryFlags = ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'keto', 'paleo'];
    const cuisines = ['italian', 'asian', 'mexican', 'french', 'indian', 'american', 'mediterranean'];

    res.json({
      success: true,
      data: {
        tags: Array.from(allTags).sort(),
        mealTypes,
        dietaryFlags,
        cuisines,
      },
    });
  } catch (error) {
    console.error('Get filter options error:', error);
    res.status(500).json({ success: false, error: 'Failed to get filter options' });
  }
};
