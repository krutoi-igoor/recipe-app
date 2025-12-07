import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Web URL import: Fetch and parse recipe from URL
 * Supports: recipe blogs, standard recipe sites
 */
export const importFromUrl = async (req, res) => {
  try {
    const { url, title, description } = req.validatedData;
    const userId = req.user.userId;

    // TODO: Implement URL fetching and parsing
    // For now, return placeholder structure
    const recipe = {
      userId,
      title: title || 'Imported Recipe',
      description: description || 'Imported from URL',
      ingredients: JSON.stringify([
        { name: 'Placeholder Ingredient', quantity: 1, unit: 'piece' }
      ]),
      instructions: JSON.stringify(['Step 1: Follow the recipe']),
      tags: JSON.stringify(['imported', 'web']),
    };

    const created = await prisma.recipe.create({ data: recipe });

    res.status(201).json({
      success: true,
      message: 'Recipe imported from URL (preview mode - edit before saving)',
      data: {
        ...created,
        ingredients: JSON.parse(created.ingredients),
        instructions: JSON.parse(created.instructions),
        tags: created.tags ? JSON.parse(created.tags) : [],
      },
    });
  } catch (error) {
    console.error('Import from URL error:', error);
    res.status(500).json({ success: false, error: 'Failed to import from URL' });
  }
};

/**
 * Social/video import: Extract recipe from TikTok, Instagram, YouTube
 * Fetches captions/transcript and extracts structured recipe
 */
export const importFromSocial = async (req, res) => {
  try {
    const { url, platform } = req.validatedData;
    const userId = req.user.userId;

    // TODO: Implement social media fetching and transcription
    // Platforms: TikTok, Instagram, YouTube, Shorts
    const recipe = {
      userId,
      title: `Recipe from ${platform}`,
      description: 'Imported from social media video',
      ingredients: JSON.stringify([
        { name: 'Placeholder Ingredient', quantity: 1, unit: 'piece' }
      ]),
      instructions: JSON.stringify(['Step 1: Watch the original video for details']),
      tags: JSON.stringify(['imported', 'video', platform.toLowerCase()]),
    };

    const created = await prisma.recipe.create({ data: recipe });

    res.status(201).json({
      success: true,
      message: 'Recipe imported from video (preview mode - edit before saving)',
      data: {
        ...created,
        ingredients: JSON.parse(created.ingredients),
        instructions: JSON.parse(created.instructions),
        tags: created.tags ? JSON.parse(created.tags) : [],
      },
    });
  } catch (error) {
    console.error('Import from social error:', error);
    res.status(500).json({ success: false, error: 'Failed to import from social media' });
  }
};

/**
 * Image/OCR import: Extract recipe from image (photo, screenshot, handwritten)
 * Uses OCR to extract text and structure it into ingredients/instructions
 */
export const importFromImage = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // TODO: Implement image upload and OCR
    // Use Tesseract.js or similar for OCR
    const recipe = {
      userId,
      title: 'Imported from Image',
      description: 'Extracted from image using OCR',
      ingredients: JSON.stringify([
        { name: 'Placeholder Ingredient', quantity: 1, unit: 'piece' }
      ]),
      instructions: JSON.stringify(['Step 1: Review OCR extraction']),
      tags: JSON.stringify(['imported', 'ocr']),
    };

    const created = await prisma.recipe.create({ data: recipe });

    res.status(201).json({
      success: true,
      message: 'Recipe imported from image (preview mode - edit before saving)',
      data: {
        ...created,
        ingredients: JSON.parse(created.ingredients),
        instructions: JSON.parse(created.instructions),
        tags: created.tags ? JSON.parse(created.tags) : [],
      },
    });
  } catch (error) {
    console.error('Import from image error:', error);
    res.status(500).json({ success: false, error: 'Failed to import from image' });
  }
};

/**
 * Auto-tag recipe: AI-powered tagging for cuisine, meal type, dietary flags
 */
export const autoTagRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user.userId;

    const recipe = await prisma.recipe.findUnique({
      where: { id: parseInt(recipeId) },
    });

    if (!recipe || recipe.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }

    // TODO: Implement AI tagging
    // Use OpenAI or similar to extract: cuisine, meal type, dietary flags
    const existingTags = recipe.tags ? JSON.parse(recipe.tags) : [];
    const aiTags = ['tagged', 'ai-generated']; // Placeholder

    const updated = await prisma.recipe.update({
      where: { id: parseInt(recipeId) },
      data: {
        tags: JSON.stringify([...new Set([...existingTags, ...aiTags])]),
      },
    });

    res.json({
      success: true,
      message: 'Recipe auto-tagged',
      data: {
        ...updated,
        tags: JSON.parse(updated.tags),
      },
    });
  } catch (error) {
    console.error('Auto-tag error:', error);
    res.status(500).json({ success: false, error: 'Failed to auto-tag recipe' });
  }
};
