import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import {
  createMealPlan,
  getMealPlans,
  getMealPlan,
  updateMealPlan,
  deleteMealPlan,
  getShoppingList,
} from '../controllers/mealPlanController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', validate(schemas.mealPlan), createMealPlan);
router.get('/', getMealPlans);
router.get('/shopping-list', getShoppingList);
router.get('/:id', getMealPlan);
router.put('/:id', validate(schemas.mealPlan), updateMealPlan);
router.delete('/:id', deleteMealPlan);

export default router;
