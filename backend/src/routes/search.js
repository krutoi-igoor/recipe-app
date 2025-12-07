import express from 'express';
import { searchRecipes, getFilterOptions } from '../controllers/searchController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All search routes require authentication
router.use(authMiddleware);

/**
 * GET /api/v1/search
 * Advanced recipe search with filters
 * Query params:
 *   - q: keyword search
 *   - tags: array of tags to filter by
 *   - mealType: breakfast, lunch, dinner, snack, dessert
 *   - dietary: vegan, vegetarian, gluten-free, dairy-free, etc.
 *   - cuisine: italian, asian, mexican, etc.
 *   - maxPrepTime: max prep time in minutes
 *   - maxCookTime: max cook time in minutes
 *   - limit: results per page (default 20)
 *   - offset: pagination offset (default 0)
 */
router.get('/', searchRecipes);

/**
 * GET /api/v1/search/filters
 * Get available filter options for UI dropdowns
 */
router.get('/filters', getFilterOptions);

export default router;
