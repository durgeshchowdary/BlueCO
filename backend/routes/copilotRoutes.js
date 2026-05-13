import express from 'express';
import { authenticateUser, requireAcademyScope } from '../middleware/authMiddleware.js';
import { CopilotService } from '../services/copilot/CopilotService.js';
import { ConversationContextEngine } from '../services/copilot/ConversationContextEngine.js';
import { SafeResponseEngine } from '../services/copilot/SafeResponseEngine.js';
import logger from '../services/logger.js';

const router = express.Router();
router.use(authenticateUser, requireAcademyScope);

/**
 * @typedef {object} CustomUser
 * @property {string} _id
 * @property {string} academyId
 * @property {'super_admin' | 'academy_owner' | 'coach' | 'parent'} role
 */

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
      /** @type {CustomUser} */ (req.user).academyId, // Assuming req.user.academyId is populated by authMiddleware
      /** @type {CustomUser} */ (req.user).role // Assuming req.user.role is populated by authMiddleware
    );
    context.queryId = `QRY_${Date.now()}`; // Assign a new query ID for this interaction

    // Phase 1: Central Copilot Service orchestration
    const rawResponse = await CopilotService.query(text, context);

    // Phase 9: Safe AI Response Engine
    const safeResponse = SafeResponseEngine.processResponse(rawResponse, context);

    // Update context for conversation continuity
    ConversationContextEngine.updateContext(conversationId, { relevantReport: safeResponse.groundingSignals.score ? { ...context.relevantReport, overallHealthScore: safeResponse.groundingSignals.score } : context.relevantReport });

    res.json(safeResponse);
  } catch (error) {
    logger.error('copilot.query_failed', { tenantId: /** @type {CustomUser} */ (req.user).academyId, userId: /** @type {CustomUser} */ (req.user)._id, error: error.message });
    next(error);
  }
});

// Additional endpoints for /explain, /summary, /context would follow a similar pattern,
// leveraging the CopilotService and GroundingEngine for deterministic data retrieval.

export default router;
