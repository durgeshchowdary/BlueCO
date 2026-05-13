import express from 'express';
import {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  validateBatchConflicts,
} from '../controllers/batchController.js';
import { requirePermission } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();
router.post('/conflicts/validate', requirePermission(PERMISSIONS.BATCHES_WRITE), validateBatchConflicts); // Use .js extension for local imports
router.route('/') // Use .js extension for local imports
  .get(requirePermission(PERMISSIONS.BATCHES_READ), getBatches)
  .post(requirePermission(PERMISSIONS.BATCHES_WRITE), createBatch);
router.route('/:id')
  .get(requirePermission(PERMISSIONS.BATCHES_READ), getBatchById)
  .put(requirePermission(PERMISSIONS.BATCHES_WRITE), updateBatch)
  .delete(requirePermission(PERMISSIONS.BATCHES_DELETE), deleteBatch);

export default router;
