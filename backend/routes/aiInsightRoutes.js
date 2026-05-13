import express from 'express';
import { authenticateUser, requireAcademyScope } from '../middleware/authMiddleware.js';
import { getInsights, generateInsights, updateInsightStatus } from '../controllers/aiInsightController.js';

const router = express.Router();
router.use(authenticateUser, requireAcademyScope);

router.get('/', getInsights);
router.post('/generate', generateInsights);
router.put('/:id/status', updateInsightStatus);

export default router;
