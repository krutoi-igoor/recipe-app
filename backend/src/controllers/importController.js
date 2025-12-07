import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

/**
 * Extract recipe from HTML using common recipe schema patterns
 */
const extractRecipeFromHTML = (html, url) => {
  const $ = cheerio.load(html);
  
  // Try to find JSON-LD structured data (most reliable)
  const jsonLdScripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < jsonLdScripts.length; i++) {
    try {
      const data = JSON.parse($(jsonLdScripts[i]).html());
      if (data['@type'] === 'Recipe' || (Array.isArray(data['@graph']) && data['@graph'].some(item => item['@type'] === 'Recipe'))) {
        const recipe = Array.isArray(data['@graph']) ? data['@graph'].find(item => item['@type'] === 'Recipe') : data;
        
        return {
          title: recipe.name || 'Imported Recipe',
          description: recipe.description || '',
          ingredients: Array.isArray(recipe.recipeIngredient) 
            ? recipe.recipeIngredient.map(ing => ({ name: ing, quantity: 1, unit: 'item' }))
            : [],
          instructions: Array.isArray(recipe.recipeInstructions)
            ? recipe.recipeInstructions.map(step => typeof step === 'string' ? step : step.text || step.name || '')
            : [],
          prepTime: recipe.prepTime ? parseInt(recipe.prepTime.replace(/\D/g, '')) : null,
          cookTime: recipe.cookTime ? parseInt(recipe.cookTime.replace(/\D/g, '')) : null,
          servings: recipe.recipeYield ? parseInt(String(recipe.recipeYield).replace(/\D/g, '')) : null,
          imageUrl: recipe.image?.url || (Array.isArray(recipe.image) ? recipe.image[0] : recipe.image) || null,
        };
      }
    } catch (e) {
      // Continue to next script tag
    }
  }
  
  // Fallback: Try to extract from common HTML patterns
  const title = $('h1').first().text().trim() || $('title').text().trim() || 'Imported Recipe';
  const description = $('meta[name="description"]').attr('content') || $('p').first().text().trim() || '';
  
  // Try to find ingredients list
  const ingredients = [];
  $('[class*="ingredient"], [id*="ingredient"], .recipe-ingredients li, .ingredients li').each((_, el) => {
    const text = $(el).text().trim();
    if (text) ingredients.push({ name: text, quantity: 1, unit: 'item' });
  });
  
  // Try to find instructions
  const instructions = [];
  $('[class*="instruction"], [id*="instruction"], .recipe-instructions li, .instructions li, .steps li').each((_, el) => {
    const text = $(el).text().trim();
    if (text) instructions.push(text);
  });
  
  return {
    title,
    description,
    ingredients: ingredients.length > 0 ? ingredients : [{ name: 'See original URL for ingredients', quantity: 1, unit: 'item' }],
    instructions: instructions.length > 0 ? instructions : ['See original URL for instructions'],
    prepTime: null,
    cookTime: null,
    servings: null,
    imageUrl: null,
  };
};

/**
 * Web URL import: Fetch and parse recipe from URL
 * Supports: recipe blogs, standard recipe sites with JSON-LD or common HTML patterns
 */
export const importFromUrl = async (req, res) => {
  try {
    const { url, title, description } = req.validatedData;
    const userId = req.user.userId;

    // Fetch the URL
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RecipeBot/1.0)',
      },
      timeout: 10000, // 10 second timeout
    });

    const extracted = extractRecipeFromHTML(response.data, url);
    
    // Use provided title/description or extracted ones
    const recipeData = {
      userId,
      title: title || extracted.title,
      description: description || extracted.description,
      ingredients: JSON.stringify(extracted.ingredients),
      instructions: JSON.stringify(extracted.instructions),
      prepTime: extracted.prepTime,
      cookTime: extracted.cookTime,
      servings: extracted.servings,
      imageUrl: extracted.imageUrl,
      tags: JSON.stringify(['imported', 'web']),
    };

    const created = await prisma.recipe.create({ data: recipeData });

    res.status(201).json({
      success: true,
      message: 'Recipe imported from URL (review and edit as needed)',
      data: {
        ...created,
        ingredients: JSON.parse(created.ingredients),
        instructions: JSON.parse(created.instructions),
        tags: created.tags ? JSON.parse(created.tags) : [],
        sourceUrl: url,
      },
    });
  } catch (error) {
    console.error('Import from URL error:', error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(400).json({ success: false, error: 'Unable to reach the URL' });
    }
    if (error.response?.status === 404) {
      return res.status(404).json({ success: false, error: 'URL not found' });
    }
    if (error.response?.status === 403) {
      return res.status(403).json({ success: false, error: 'Access to URL forbidden (may require authentication)' });
    }
    
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
