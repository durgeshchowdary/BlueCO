export class CopilotService {
  static async query(text, context) {
    return {
      answer: `I can help investigate: ${text}`,
      groundingSignals: { evidenceRefs: [], score: context.relevantReport?.overallHealthScore },
      explainability: {
        contributingMetrics: {},
        anomaliesUsed: [],
        trendsUsed: [],
        recommendationBasis: [],
        confidenceReasoning: 'Response generated from the current request context.',
        replayReferences: [],
        telemetryReferences: [],
      },
      suggestedActions: [],
      isHallucinationSafe: true,
      timestamp: new Date(),
    };
  }
}
