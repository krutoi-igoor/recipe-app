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
 * For now: returns placeholder with video metadata and source URL
 * Future: integrate with yt-dlp, instagrapi, or TikTok API for transcript extraction
 */
export const importFromSocial = async (req, res) => {
  try {
    const { url, platform } = req.validatedData;
    const userId = req.user.userId;

    // Extract video ID and metadata from URL
    let videoId = '';
    let videoTitle = '';
    if (platform.toLowerCase() === 'youtube' && url.includes('youtube')) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\\w-]+)/);
      videoId = match ? match[1] : 'unknown';
      videoTitle = `YouTube Recipe Video - ${videoId}`;
    } else if (platform.toLowerCase() === 'tiktok' && url.includes('tiktok')) {
      videoTitle = 'TikTok Recipe Video';
    } else if (platform.toLowerCase() === 'instagram' && url.includes('instagram')) {
      videoTitle = 'Instagram Recipe Video';
    }

    const recipe = {
      userId,
      title: videoTitle || `Recipe from ${platform}`,
      description: `Imported from ${platform} video. Review extracted text and edit as needed.\nOriginal: ${url}`,
      ingredients: JSON.stringify([
        { name: 'Ingredient 1', quantity: 1, unit: 'item' },
        { name: 'Ingredient 2', quantity: 1, unit: 'item' }
      ]),
      instructions: JSON.stringify([
        'Step 1: Watch the original video for cooking instructions',
        'Step 2: Adjust quantities based on your needs'
      ]),
      imageUrl: null,
      tags: JSON.stringify(['imported', 'video', platform.toLowerCase()]),
    };

    const created = await prisma.recipe.create({ data: recipe });

    res.status(201).json({
      success: true,
      message: 'Video recipe imported (requires manual review and editing)',
      data: {
        ...created,
        ingredients: JSON.parse(created.ingredients),
        instructions: JSON.parse(created.instructions),
        tags: created.tags ? JSON.parse(created.tags) : [],
        sourceUrl: url,
      },
    });
  } catch (error) {
    console.error('Import from social error:', error);
    res.status(500).json({ success: false, error: 'Failed to import from social media' });
  }
};

/**
 * Image/OCR import: Extract recipe from image (photo, screenshot, handwritten)
 * For now: accepts image URL and returns placeholder
 * Future: integrate with Tesseract.js or Google Vision API for OCR
 */
export const importFromImage = async (req, res) => {
  try {
    const { imageUrl, title } = req.validatedData;
    const userId = req.user.userId;
    
    const recipe = {
      userId,
      title: title || 'Recipe from Image',
      description: 'Extracted from image. Please review and correct OCR results.',
      ingredients: JSON.stringify([
        { name: 'Ingredient extracted from image', quantity: 1, unit: 'item' }
      ]),
      instructions: JSON.stringify([
        'Step 1: Review OCR-extracted text from image',
        'Step 2: Correct any OCR errors'
      ]),
      imageUrl: imageUrl || null,
      tags: JSON.stringify(['imported', 'ocr']),
    };

    const created = await prisma.recipe.create({ data: recipe });

    res.status(201).json({
      success: true,
      message: 'Recipe imported from image (requires OCR review and manual correction)',
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
 * Auto-tag recipe: Rule-based tagging for cuisine, meal type, dietary flags
 * Analyzes title, ingredients, and instructions for keywords
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

    const text = `${recipe.title || ''} ${recipe.description || ''} ${recipe.ingredients || ''} ${recipe.instructions || ''}`.toLowerCase();
    const tags = new Set(recipe.tags ? JSON.parse(recipe.tags) : []);

    // Cuisine detection
    if (text.match(/\b(thai|lemongrass|fish sauce|pad thai)\b/)) tags.add('thai');
    if (text.match(/\b(italian|pasta|tomato sauce|basil|olive oil)\b/)) tags.add('italian');
    if (text.match(/\b(mexican|taco|salsa|cilantro|jalapeno)\b/)) tags.add('mexican');
    if (text.match(/\b(japanese|sushi|wasabi|teriyaki)\b/)) tags.add('japanese');
    if (text.match(/\b(chinese|stir-?fry|soy sauce)\b/)) tags.add('chinese');
    if (text.match(/\b(indian|curry|turmeric|coriander)\b/)) tags.add('indian');
    if (text.match(/\b(mediterranean|olive|feta|hummus)\b/)) tags.add('mediterranean');

    // Meal type detection
    if (text.match(/\b(breakfast|pancake|waffle|oatmeal)\b/)) tags.add('breakfast');
    if (text.match(/\b(lunch|sandwich|salad|wrap)\b/)) tags.add('lunch');
    if (text.match(/\b(dinner|main|entree)\b/)) tags.add('dinner');
    if (text.match(/\b(dessert|cake|cookie|brownie|mousse)\b/)) tags.add('dessert');
    if (text.match(/\b(appetizer|starter|snack)\b/)) tags.add('appetizer');

    // Dietary flags
    if (text.match(/\b(vegan|vegetarian|no meat)\b/)) tags.add('vegan');
    if (text.match(/\b(gluten-?free|gf)\b/)) tags.add('gluten-free');
    if (text.match(/\b(dairy-?free|lactose)\b/)) tags.add('dairy-free');
    if (text.match(/\b(keto|low-?carb)\b/)) tags.add('keto');
    if (text.match(/\b(paleo)\b/)) tags.add('paleo');
    if (text.match(/\b(quick|easy|simple|15 min|30 min)\b/)) tags.add('quick');
    if (text.match(/\b(healthy|low-?cal|nutritious)\b/)) tags.add('healthy');

    tags.add('auto-tagged');

    const updated = await prisma.recipe.update({
      where: { id: parseInt(recipeId) },
      data: {
        tags: JSON.stringify([...tags]),
      },
    });

    res.json({
      success: true,
      message: `Recipe auto-tagged with ${updated.tags ? JSON.parse(updated.tags).length : 0} tags`,
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
