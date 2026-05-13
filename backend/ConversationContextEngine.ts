import { CopilotContext } from './intelligence';
import { IntelligenceAggregator } from './IntelligenceAggregator';
import logger from './logger';

export class ConversationContextEngine {
  private static contexts: Map<string, CopilotContext> = new Map(); // conversationId -> CopilotContext

  /**
   * Retrieves or initializes a conversation context.
   */
  public static async getOrCreateContext(
    conversationId: string, 
    tenantId: string, 
    userRole: CopilotContext['userRole']
  ): Promise<CopilotContext> {
    let context = this.contexts.get(conversationId);
    if (context && context.tenantId === tenantId && context.userRole === userRole) {
      return context;
    }

    // Initialize new context
    context = {
      tenantId,
      userRole,
      conversationId,
      queryId: `QRY_${Date.now()}`, // New query ID for each interaction
      relevantReport: undefined, // Will be populated by GroundingEngine
      recentTimeline: [],
      activeAnomalies: []
    };

    // Enrich with historical data (replay-safe, warehouse-backed)
    try {
      context.recentTimeline = await IntelligenceAggregator.getTimeline(tenantId, 5);
      // context.activeAnomalies = await AnomalyDetector.getActiveAnomalies(tenantId); // Assuming this method exists
    } catch (error) {
      logger.error('conversation.context_enrichment_failed', { tenantId, conversationId, error });
    }

    this.contexts.set(conversationId, context);
    return context;
  }

  public static updateContext(conversationId: string, patch: Partial<CopilotContext>): void {
    const context = this.contexts.get(conversationId);
    if (context) Object.assign(context, patch);
  }
}
