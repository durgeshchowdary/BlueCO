const express = require('express');
const {
  getCoaches,
  getCoachById,
  createCoach,
  importCoaches,
  updateCoach,
  deleteCoach,
} = require('../controllers/coachController');
const { requirePermission } = require('../middleware/authMiddleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();
router.route('/')
  .get(requirePermission(PERMISSIONS.COACHES_READ), getCoaches)
  .post(requirePermission(PERMISSIONS.COACHES_WRITE), createCoach);
router.post('/import', requirePermission(PERMISSIONS.COACHES_WRITE), importCoaches);
router.route('/:id')
  .get(requirePermission(PERMISSIONS.COACHES_READ), getCoachById)
  .put(requirePermission(PERMISSIONS.COACHES_WRITE), updateCoach)
  .delete(requirePermission(PERMISSIONS.COACHES_DELETE), deleteCoach);

module.exports = router;
