import express from 'express';
import {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
} from '../controllers/recipeController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// All recipe routes require authentication
router.use(authMiddleware);

router.post('/', validate(schemas.recipe), createRecipe);
router.get('/', getRecipes);
router.get('/:id', getRecipeById);
router.put('/:id', validate(schemas.recipe), updateRecipe);
router.delete('/:id', deleteRecipe);

export default router;
