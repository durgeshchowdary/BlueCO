import { CopilotResponse, CopilotContext, Recommendation } from './intelligence';
import logger from './logger';

export class SafeResponseEngine {
  /**
   * Ensures AI responses are safe, RBAC-compliant, and handle low-confidence scenarios.
   */
  public static processResponse(response: CopilotResponse, context: CopilotContext): CopilotResponse {
    // Phase 9: Hallucination Prevention
    if (!response.isHallucinationSafe) {
      logger.warn('copilot.hallucination_risk_detected', { tenantId: context.tenantId, conversationId: context.conversationId, queryId: context.queryId, answer: response.answer });
      return this.fallbackResponse(context, 'I am unable to provide a fully confident answer based on the available data. Please try rephrasing your query or consult the operational dashboards.');
    }

    // Phase 9: RBAC-safe Filtering (e.g., filter recommendations by user role)
    response.suggestedActions = this.filterRecommendationsByRole(response.suggestedActions, context.userRole);

    // Phase 9: Low-confidence fallback handling (if confidenceScore was part of CopilotResponse)
    // if (response.groundingSignals.confidenceScore < 0.5) {
    //   return this.fallbackResponse(context, 'My confidence in this answer is low. Please verify with a human operator.');
    // }

    return response;
  }

  private static fallbackResponse(context: CopilotContext, message: string): CopilotResponse {
    return {
      answer: message,
      groundingSignals: { evidenceRefs: [] },
      explainability: { contributingMetrics: {}, anomaliesUsed: [], trendsUsed: [], recommendationBasis: [], confidenceReasoning: "Fallback due to safety concerns.", replayReferences: [], telemetryReferences: [] },
      suggestedActions: [],
      isHallucinationSafe: false,
      timestamp: new Date()
    };
  }

  private static filterRecommendationsByRole(recommendations: Recommendation[], userRole: CopilotContext['userRole']): Recommendation[] {
    // Example: Parents/Coaches might not see 'platform' impactArea recommendations
    if (userRole === 'parent' || userRole === 'coach') {
      return recommendations.filter(rec => rec.impactArea !== 'platform' && rec.impactArea !== 'finance');
    }
    return recommendations;
  }
}
