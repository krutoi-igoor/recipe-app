import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Save a search query
 */
export const saveSearch = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, query } = req.body;

    if (!name || !query) {
      return res.status(400).json({ error: 'Name and query are required' });
    }

    const saved = await prisma.savedSearch.create({
      data: {
        userId,
        name,
        query: JSON.stringify(query),
      },
    });

    res.status(201).json({ data: saved });
  } catch (err) {
    console.error('Save search error:', err);
    res.status(500).json({ error: err.message || 'Failed to save search' });
  }
};

/**
 * Get all saved searches for user
 */
export const getSavedSearches = async (req, res) => {
  try {
    const userId = req.user.userId;

    const searches = await prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Parse query JSON
    const parsed = searches.map(s => ({
      ...s,
      query: JSON.parse(s.query),
    }));

    res.json({ data: parsed });
  } catch (err) {
    console.error('Get saved searches error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch searches' });
  }
};

/**
 * Update a saved search
 */
export const updateSavedSearch = async (req, res) => {
  try {
    const userId = req.user.userId;
    const searchId = parseInt(req.params.id);
    const { name, query } = req.body;

    // Verify ownership
    const search = await prisma.savedSearch.findUnique({
      where: { id: searchId },
    });

    if (!search || search.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.savedSearch.update({
      where: { id: searchId },
      data: {
        name: name || search.name,
        query: query ? JSON.stringify(query) : search.query,
      },
    });

    res.json({
      data: {
        ...updated,
        query: JSON.parse(updated.query),
      },
    });
  } catch (err) {
    console.error('Update saved search error:', err);
    res.status(500).json({ error: err.message || 'Failed to update search' });
  }
};

/**
 * Delete a saved search
 */
export const deleteSavedSearch = async (req, res) => {
  try {
    const userId = req.user.userId;
    const searchId = parseInt(req.params.id);

    // Verify ownership
    const search = await prisma.savedSearch.findUnique({
      where: { id: searchId },
    });

    if (!search || search.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.savedSearch.delete({
      where: { id: searchId },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Delete saved search error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete search' });
  }
};
