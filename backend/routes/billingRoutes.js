import express from 'express';
import { authenticateUser, requireAcademyScope } from '../middleware/authMiddleware.js';
import {
  getBillingOverview,
  getInvoices,
  downloadInvoice,
  runBillingAutomation,
} from '../controllers/billingController.js';

const router = express.Router();
router.use(authenticateUser, requireAcademyScope);

router.get('/overview', getBillingOverview);
router.get('/invoices', getInvoices);
router.get('/invoices/:id/download', downloadInvoice);
router.post('/automation/run', runBillingAutomation);

export default router;
