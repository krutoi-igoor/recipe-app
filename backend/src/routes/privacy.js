import express from 'express';
import {
  exportAsJson,
  exportAsCSV,
  deleteAllUserData,
  getDataSummary,
} from '../controllers/privacyController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All privacy routes require authentication
router.use(authMiddleware);

/**
 * GET /api/v1/privacy/data-summary
 * Get summary of user's data for transparency/GDPR compliance
 */
router.get('/data-summary', getDataSummary);

/**
 * GET /api/v1/privacy/export/json
 * Export entire user library as JSON (GDPR data portability)
 */
router.get('/export/json', exportAsJson);

/**
 * GET /api/v1/privacy/export/csv
 * Export recipes as CSV
 */
router.get('/export/csv', exportAsCSV);

/**
 * DELETE /api/v1/privacy/delete-all
 * Permanently delete all user data (GDPR right to erasure)
 * Body: { confirmPassword: string }
 */
router.delete('/delete-all', deleteAllUserData);

export default router;
