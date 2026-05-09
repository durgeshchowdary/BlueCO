const express = require('express');
const {
  getCoaches,
  getCoachById,
  createCoach,
  importCoaches,
  updateCoach,
  deleteCoach,
} = require('../controllers/coachController');

const router = express.Router();
router.route('/').get(getCoaches).post(createCoach);
router.post('/import', importCoaches);
router.route('/:id').get(getCoachById).put(updateCoach).delete(deleteCoach);

module.exports = router;
