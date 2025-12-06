import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import {
  createCollection,
  getCollections,
  addRecipeToCollection,
  removeRecipeFromCollection,
  deleteCollection,
} from '../controllers/collectionController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', validate(schemas.collection), createCollection);
router.get('/', getCollections);
router.post('/:collectionId/recipes', validate(schemas.collectionRecipe), addRecipeToCollection);
router.delete('/:collectionId/recipes/:recipeId', removeRecipeFromCollection);
router.delete('/:id', deleteCollection);

export default router;
