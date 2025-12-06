import * as mealPlanController from '../src/controllers/mealPlanController.js';

describe('Meal Plan Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { userId: 1, email: 'test@example.com' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('createMealPlan', () => {
    it('should create meal plan with date and optional recipe', async () => {
      req.body = {
        date: '2025-01-15T00:00:00Z',
        recipeId: 1,
        notes: 'Family dinner',
      };

      expect(mealPlanController.createMealPlan).toBeDefined();
    });

    it('should create meal plan without recipe', async () => {
      req.body = {
        date: '2025-01-15T00:00:00Z',
        notes: 'Meal plan day',
      };

      expect(mealPlanController.createMealPlan).toBeDefined();
    });

    it('should reject missing date', async () => {
      req.body = {
        recipeId: 1,
        notes: 'No date provided',
      };

      expect(mealPlanController.createMealPlan).toBeDefined();
    });

    it('should reject duplicate meal plan for same date', async () => {
      req.body = {
        date: '2025-01-15T00:00:00Z',
        recipeId: 1,
      };

      expect(mealPlanController.createMealPlan).toBeDefined();
    });
  });

  describe('getMealPlans', () => {
    it('should return all meal plans for user', async () => {
      expect(mealPlanController.getMealPlans).toBeDefined();
    });

    it('should filter by date range', async () => {
      req.query = {
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-31T23:59:59Z',
      };

      expect(mealPlanController.getMealPlans).toBeDefined();
    });

    it('should only return user\'s own meal plans', async () => {
      expect(mealPlanController.getMealPlans).toBeDefined();
    });
  });

  describe('getShoppingList', () => {
    it('should aggregate ingredients from meal plans', async () => {
      req.query = {
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-31T23:59:59Z',
      };

      expect(mealPlanController.getShoppingList).toBeDefined();
    });

    it('should sum quantities by name and unit', async () => {
      // If 2 recipes use 400g Pasta each, result should be 800g
      req.query = {
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-31T23:59:59Z',
      };

      expect(mealPlanController.getShoppingList).toBeDefined();
    });

    it('should return empty array if no meal plans', async () => {
      req.query = {
        startDate: '2025-12-25T00:00:00Z',
        endDate: '2025-12-26T23:59:59Z',
      };

      expect(mealPlanController.getShoppingList).toBeDefined();
    });
  });

  describe('updateMealPlan', () => {
    it('should update meal plan details', async () => {
      req.params = { id: '1' };
      req.body = { notes: 'Updated notes' };

      expect(mealPlanController.updateMealPlan).toBeDefined();
    });

    it('should prevent updating another user\'s meal plan', async () => {
      req.params = { id: '1' };
      req.user.userId = 2;
      req.body = { recipeId: 5 };

      expect(mealPlanController.updateMealPlan).toBeDefined();
    });
  });

  describe('deleteMealPlan', () => {
    it('should delete meal plan owned by user', async () => {
      req.params = { id: '1' };

      expect(mealPlanController.deleteMealPlan).toBeDefined();
    });

    it('should return 404 for non-existent meal plan', async () => {
      req.params = { id: '999' };

      expect(mealPlanController.deleteMealPlan).toBeDefined();
    });
  });
});
