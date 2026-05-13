import express from 'express';
const { authenticateUser, requireAcademyScope } = require('./middleware/authMiddleware');
import { CopilotService } from './CopilotService.js';
import { ConversationContextEngine } from './ConversationContextEngine.js';
import { SafeResponseEngine } from './SafeResponseEngine.js';
import logger from './logger.js';

const router = express.Router();
router.use(authenticateUser, requireAcademyScope);

/**
 * POST /api/copilot/query
 * Main endpoint for conversational AI queries.
 */
router.post('/query', async (req, res, next) => {
  try {
    const { text, conversationId } = req.body;
    if (!text || !conversationId) {
      return res.status(400).json({ message: 'Text and conversationId are required.' });
    }

    // Phase 8: AI Memory + Context Layer
    const context = await ConversationContextEngine.getOrCreateContext(
      conversationId,
      (req as any).user.academyId,
      (req as any).user.role
    );
    context.queryId = `QRY_${Date.now()}`; // Assign a new query ID for this interaction

    // Phase 1: Central Copilot Service orchestration
    const rawResponse = await CopilotService.query(text, context);

    // Phase 9: Safe AI Response Engine
    const safeResponse = SafeResponseEngine.processResponse(rawResponse, context);

    // Update context for conversation continuity
    ConversationContextEngine.updateContext(conversationId, { relevantReport: context.relevantReport });

    res.json(safeResponse);
  } catch (error: any) {
    logger.error('copilot.query_failed', {
      tenantId: (req as any).user?.academyId,
      userId: (req as any).user?._id,
      error: error?.message || 'Unknown copilot error'
    });
    next(error);
  }
});

// Additional endpoints for /explain, /summary, /context would follow a similar pattern,
// leveraging the CopilotService and GroundingEngine for deterministic data retrieval.

export default router;
