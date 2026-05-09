const express = require('express');
const {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
} = require('../controllers/batchController');

const router = express.Router();
router.route('/').get(getBatches).post(createBatch);
router.route('/:id').get(getBatchById).put(updateBatch).delete(deleteBatch);

module.exports = router;
