import express from 'express';
const router = express.Router();
import { createDemoRequest, getDemoRequests } from '../controllers/demoRequestController.js';

router.post('/', createDemoRequest); // Use .js extension for local imports
router.get('/', getDemoRequests); // Use .js extension for local imports

export default router;