import express from 'express';
import {
  importFromUrl,
  importFromSocial,
  importFromImage,
  autoTagRecipe,
} from '../controllers/importController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// All import routes require authentication
router.use(authMiddleware);

/**
 * POST /api/v1/imports/url
 * Import recipe from web URL
 * Body: { url: string, title?: string, description?: string }
 */
router.post('/url', validate(schemas.urlImport), importFromUrl);

/**
 * POST /api/v1/imports/social
 * Import recipe from social media (TikTok, Instagram, YouTube)
 * Body: { url: string, platform: 'tiktok' | 'instagram' | 'youtube' | 'shorts' }
 */
router.post('/social', validate(schemas.socialImport), importFromSocial);

/**
 * POST /api/v1/imports/image
 * Import recipe from image (photo, screenshot, handwritten)
 * Body: FormData with 'image' file
 */
router.post('/image', importFromImage);

/**
 * POST /api/v1/imports/:recipeId/auto-tag
 * Auto-tag a recipe with AI (cuisine, meal type, dietary flags)
 * Params: recipeId
 */
router.post('/:recipeId/auto-tag', autoTagRecipe);

export default router;
