const express = require('express');
const {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
} = require('../controllers/batchController');
const { requirePermission } = require('../middleware/authMiddleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();
router.route('/')
  .get(requirePermission(PERMISSIONS.BATCHES_READ), getBatches)
  .post(requirePermission(PERMISSIONS.BATCHES_WRITE), createBatch);
router.route('/:id')
  .get(requirePermission(PERMISSIONS.BATCHES_READ), getBatchById)
  .put(requirePermission(PERMISSIONS.BATCHES_WRITE), updateBatch)
  .delete(requirePermission(PERMISSIONS.BATCHES_DELETE), deleteBatch);

module.exports = router;
