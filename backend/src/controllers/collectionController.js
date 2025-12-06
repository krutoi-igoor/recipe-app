import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createCollection = async (req, res) => {
  try {
    const { name } = req.validatedData;
    const userId = req.user.userId;

    const createdCollection = await prisma.collection.create({
      data: {
        userId,
        name,
      },
    });

    res.status(201).json({ success: true, data: createdCollection });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCollections = async (req, res) => {
  try {
    const userId = req.user.userId;

    const collections = await prisma.collection.findMany({
      where: { userId },
      include: {
        recipes: {
          include: {
            recipe: true,
          },
        },
      },
    });

    res.json({ success: true, data: collections });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addRecipeToCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { recipeId } = req.validatedData;
    const userId = req.user.userId;

    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(collectionId) },
    });

    if (!collection || collection.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Collection not found' });
    }

    const collectionRecipe = await prisma.collectionRecipe.create({
      data: {
        collectionId: parseInt(collectionId),
        recipeId,
      },
      include: {
        recipe: true,
      },
    });

    res.status(201).json({ success: true, data: collectionRecipe });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Recipe already in collection' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

export const removeRecipeFromCollection = async (req, res) => {
  try {
    const { collectionId, recipeId } = req.params;
    const userId = req.user.userId;

    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(collectionId) },
    });

    if (!collection || collection.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Collection not found' });
    }

    await prisma.collectionRecipe.delete({
      where: {
        collectionId_recipeId: {
          collectionId: parseInt(collectionId),
          recipeId: parseInt(recipeId),
        },
      },
    });

    res.json({ success: true, message: 'Recipe removed from collection' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(id) },
    });

    if (!collection || collection.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Collection not found' });
    }

    await prisma.collection.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: 'Collection deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
