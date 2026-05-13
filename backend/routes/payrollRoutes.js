import express from 'express';
import { authenticateUser, requireAcademyScope } from '../middleware/authMiddleware.js';
import { getPayroll, generatePayroll, updatePayroll } from '../controllers/payrollController.js';

const router = express.Router();
router.use(authenticateUser, requireAcademyScope);

router.get('/', getPayroll);
router.post('/generate', generatePayroll);
router.put('/:id', updatePayroll);

export default router;
