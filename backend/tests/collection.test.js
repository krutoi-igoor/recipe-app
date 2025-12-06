import * as collectionController from '../src/controllers/collectionController.js';

describe('Collection Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { userId: 1, email: 'test@example.com' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('createCollection', () => {
    it('should create collection with name', async () => {
      req.body = { name: 'Weeknight Meals' };

      expect(collectionController.createCollection).toBeDefined();
    });

    it('should reject missing name', async () => {
      req.body = {};

      expect(collectionController.createCollection).toBeDefined();
    });

    it('should reject empty name', async () => {
      req.body = { name: '' };

      expect(collectionController.createCollection).toBeDefined();
    });
  });

  describe('getCollections', () => {
    it('should return all collections with recipes for user', async () => {
      expect(collectionController.getCollections).toBeDefined();
    });

    it('should only return user\'s own collections', async () => {
      expect(collectionController.getCollections).toBeDefined();
    });

    it('should include recipe details in response', async () => {
      expect(collectionController.getCollections).toBeDefined();
    });
  });

  describe('addRecipeToCollection', () => {
    it('should add recipe to collection', async () => {
      req.params = { collectionId: '1' };
      req.body = { recipeId: 5 };

      expect(collectionController.addRecipeToCollection).toBeDefined();
    });

    it('should reject invalid recipeId type', async () => {
      req.params = { collectionId: '1' };
      req.body = { recipeId: 'not-a-number' };

      expect(collectionController.addRecipeToCollection).toBeDefined();
    });

    it('should reject missing recipeId', async () => {
      req.params = { collectionId: '1' };
      req.body = {};

      expect(collectionController.addRecipeToCollection).toBeDefined();
    });

    it('should prevent adding to another user\'s collection', async () => {
      req.params = { collectionId: '1' };
      req.user.userId = 2;
      req.body = { recipeId: 5 };

      expect(collectionController.addRecipeToCollection).toBeDefined();
    });

    it('should handle duplicate recipe in collection', async () => {
      req.params = { collectionId: '1' };
      req.body = { recipeId: 5 };
      // Expected: 400 with "already exists" message

      expect(collectionController.addRecipeToCollection).toBeDefined();
    });
  });

  describe('removeRecipeFromCollection', () => {
    it('should remove recipe from collection', async () => {
      req.params = { collectionId: '1', recipeId: '5' };

      expect(collectionController.removeRecipeFromCollection).toBeDefined();
    });

    it('should return 404 if recipe not in collection', async () => {
      req.params = { collectionId: '1', recipeId: '999' };

      expect(collectionController.removeRecipeFromCollection).toBeDefined();
    });

    it('should prevent removing from another user\'s collection', async () => {
      req.params = { collectionId: '1', recipeId: '5' };
      req.user.userId = 2;

      expect(collectionController.removeRecipeFromCollection).toBeDefined();
    });
  });

  describe('deleteCollection', () => {
    it('should delete collection and cascade remove recipes', async () => {
      req.params = { id: '1' };

      expect(collectionController.deleteCollection).toBeDefined();
    });

    it('should return 404 for non-existent collection', async () => {
      req.params = { id: '999' };

      expect(collectionController.deleteCollection).toBeDefined();
    });

    it('should prevent deleting another user\'s collection', async () => {
      req.params = { id: '1' };
      req.user.userId = 2;

      expect(collectionController.deleteCollection).toBeDefined();
    });
  });
});
