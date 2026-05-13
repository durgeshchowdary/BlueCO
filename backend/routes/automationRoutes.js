import express from 'express';
import { authenticateUser, requireSuperAdmin } from '../middleware/authMiddleware.js';
import { getAutomationLogs, runAutomationJob } from '../controllers/automationController.js';

const router = express.Router();
router.use(authenticateUser, requireSuperAdmin());

router.get('/logs', getAutomationLogs);
router.post('/jobs/:jobName/run', runAutomationJob);

export default router;
