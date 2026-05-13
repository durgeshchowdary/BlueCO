import express from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { requirePermission } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../constants/permissions.js';
const router = express.Router();
router.get('/summary', requirePermission(PERMISSIONS.REPORTS_READ), getDashboardSummary); // Use .js extension for local imports
export default router;
