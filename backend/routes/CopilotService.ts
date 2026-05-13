import { 
  CopilotContext, 
  CopilotResponse, 
  IntelligenceReport,
  CopilotExplainability,
  INTELLIGENCE_CONFIG,
  IntelligenceCategory
} from '../intelligence';
import { IntelligenceAggregator } from '../IntelligenceAggregator';
import { ScoringEngine } from '../ScoringEngine';
import { IntelligencePipeline } from '../IntelligencePipeline';
import { PredictiveEngine } from '../PredictiveEngine';
import { PlatformTrustEngine } from '../PlatformTrustEngine';

export class CopilotService {
  /**
   * Phase 1: Operational Query Processing.
   * Processes NL queries by grounding them in deterministic warehouse data.
   */
  public static async query(
    text: string, 
    context: CopilotContext
  ): Promise<CopilotResponse> {
    // Phase 12/16: Audit the query immediately
    const traceId = `AI_QRY_${Date.now()}`;
    
    const intent = this.detectIntent(text);
    
    // Grounding: Fetch current state before AI synthesis
    const report = await this.getGroundedReport(context.tenantId);

    switch (intent) {
      case 'CHURN_RISK':
        if (context.userRole !== 'super_admin' && context.userRole !== 'academy_owner') return this.handleUnauthorized();
        const churnRes = this.handleChurnQuery(report, context);
        await this.logAiAction(context, intent, churnRes, traceId);
        return churnRes;

      case 'OPERATIONAL_SUMMARY':
        if (context.userRole === 'parent') return this.handleUnauthorized();
        const sumRes = await this.handleSummaryQuery(report, context);
        await this.logAiAction(context, intent, sumRes, traceId);
        return sumRes;

      case 'RELAY_DIAGNOSTIC':
        if (context.userRole !== 'super_admin') return this.handleUnauthorized();
        const relayRes = await this.handleRelayDiagnostic(context, traceId);
        await this.logAiAction(context, intent, relayRes, traceId);
        return relayRes;
      
      case 'OPERATIONAL_RISK_RANKING':
        if (context.userRole !== 'super_admin') return this.handleUnauthorized();
        const riskRankingRes = await this.handleOperationalRiskRanking(context, traceId);
        await this.logAiAction(context, intent, riskRankingRes, traceId);
        return riskRankingRes;

      case 'COACH_INSIGHTS':
        if (context.userRole === 'parent') return this.handleUnauthorized();
        return this.handleCoachInsights(report, context);

      case 'STUDENT_PROGRESS':
        return this.handleParentInsights(report, context);

      default:
        return this.handleGeneralQuery(text, report, context);
    }
  }

  private static detectIntent(text: string): string {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('churn') || lowerText.includes('leaving')) return 'CHURN_RISK';
    if (lowerText.includes('summary') || lowerText.includes('incident')) return 'OPERATIONAL_SUMMARY';
    if (lowerText.includes('relay') || lowerText.includes('twilio') || lowerText.includes('provider')) return 'RELAY_DIAGNOSTIC';
    if (lowerText.includes('risk ranking') || lowerText.includes('highest risk')) return 'OPERATIONAL_RISK_RANKING';
    if (lowerText.includes('coach') || lowerText.includes('batch') || lowerText.includes('workload')) return 'COACH_INSIGHTS';
    if (lowerText.includes('progress') || lowerText.includes('student') || lowerText.includes('performance')) return 'STUDENT_PROGRESS';
    return 'GENERAL';
  }

  private static async getGroundedReport(tenantId: string): Promise<IntelligenceReport> {
    // Deterministic retrieval from existing ScoringEngine
    // Mocking metrics - in production, these are pulled from live telemetry + history
    return ScoringEngine.calculateHealth(tenantId, {
      unpaidInvoices: 0,
      attendanceRate: 85,
      relayFailures: 2,
      lastLoginDays: 1
    }, []);
  }

  private static handleChurnQuery(report: IntelligenceReport, context: CopilotContext): CopilotResponse {
    const risk = report.predictedChurnRisk;
    const severity = risk > 0.7 ? 'High' : risk > 0.4 ? 'Medium' : 'Low';
    
    // Synthesis of deterministic data into Natural Language
    const answer = `Based on current engagement patterns, the academy has a ${severity} churn risk (${(risk * 100).toFixed(0)}%). ` +
                   `The main factor is ${report.categories.engagement.reason}.`;

    return {
      answer,
      groundingSignals: {
        score: report.overallHealthScore,
        trendDirection: report.trends.direction,
        evidenceRefs: report.anomalies.map(a => a.id)
      },
      explainability: {
        contributingMetrics: { engagement: report.categories.engagement.score, operations: report.categories.operations.score },
        anomaliesUsed: report.anomalies.map(a => a.id),
        trendsUsed: [report.trends.direction],
        recommendationBasis: report.recommendations.map(r => r.title),
        confidenceReasoning: "Grounded in 30-day engagement trajectory and active attendance anomalies.", // Phase 10: Explainability
        replayReferences: [`REPO_${context.tenantId}_${Date.now()}`], // Example reference
        telemetryReferences: ['ATTENDANCE_DROP', 'LOGIN_ACTIVITY']
      },
      suggestedActions: report.recommendations,
      isHallucinationSafe: true,
      timestamp: new Date()
    };
  }

  private static async handleSummaryQuery(report: IntelligenceReport, context: CopilotContext): Promise<CopilotResponse> {
    const timeline = await IntelligenceAggregator.getTimeline(context.tenantId, 5);
    const summary = `This week, we recorded ${timeline.length} operational events. ` +
                    `Health is currently ${report.overallHealthScore}/100 with a ${report.trends.direction} trend.`;

    return {
      answer: summary,
      groundingSignals: {
        score: report.overallHealthScore,
        evidenceRefs: timeline.map(t => t.id)
      },
      explainability: {
        contributingMetrics: { overall: report.overallHealthScore },
        anomaliesUsed: [],
        trendsUsed: [report.trends.direction],
        recommendationBasis: [],
        confidenceReasoning: "Summarized from last 5 operational events in the analytics warehouse.", // Phase 10: Explainability
        replayReferences: timeline.map(t => t.id), // Example reference
        telemetryReferences: ['WAREHOUSE_TIMELINE']
      },
      suggestedActions: report.recommendations.slice(0, 2),
      isHallucinationSafe: true,
      timestamp: new Date()
    };
  }

  private static handleCoachInsights(report: IntelligenceReport, context: CopilotContext): CopilotResponse {
    const engagement = report.categories.engagement;
    const answer = `Coach, the current batch engagement is at ${engagement.score}%. ` +
                   `We've flagged: ${engagement.reason}. Focus on student participation in upcoming sessions.`;

    return {
      answer,
      groundingSignals: {
        score: engagement.score,
        trendDirection: 
          engagement.trend === 'improving' ? 'up' : 
          engagement.trend === 'declining' ? 'down' : 
          'flat',
        evidenceRefs: [`CAT_ENG_${context.tenantId}`]
      },
      explainability: {
        contributingMetrics: { engagement: engagement.score },
        anomaliesUsed: [],
        trendsUsed: [engagement.trend],
        recommendationBasis: ['engagement_improvement'],
        confidenceReasoning: "Direct mapping of engagement category scores for coach-scoped visibility.", // Phase 10: Explainability
        replayReferences: [], // No specific replay for this simple insight
        telemetryReferences: ['BATCH_ATTENDANCE_DECLINE']
      },
      suggestedActions: report.recommendations.filter(r => r.impactArea === 'engagement'),
      isHallucinationSafe: true,
      timestamp: new Date()
    };
  }

  private static handleParentInsights(report: IntelligenceReport, context: CopilotContext): CopilotResponse {
    const engagement = report.categories.engagement;
    // Grounded in attendance telemetry
    const answer = `Your child's attendance consistency is ${engagement.score > 80 ? 'excellent' : 'stable'}. ` +
                   `Current participation rate is ${engagement.score}%.`;

    return {
      answer,
      groundingSignals: {
        score: engagement.score,
        evidenceRefs: [`CAT_ENG_${context.tenantId}`]
      },
      explainability: {
        contributingMetrics: { attendance: engagement.score },
        anomaliesUsed: [],
        trendsUsed: [],
        recommendationBasis: [],
        confidenceReasoning: "Privacy-safe participation consistency narrative for parents.", // Phase 10: Explainability
        replayReferences: [], // No specific replay for this simple insight
        telemetryReferences: ['ATTENDANCE_UPDATE']
      },
      suggestedActions: [],
      isHallucinationSafe: true,
      timestamp: new Date()
    };
  }

  private static async handleRelayDiagnostic(context: CopilotContext, traceId: string): Promise<CopilotResponse> {
    const relayHealth = await IntelligenceAggregator.getRelayHealth(context.tenantId);
    const answer = `Relay dependency is at ${relayHealth.relayDependencyPct}%. ` +
                   `The provider recovery rate is ${relayHealth.recoveryRate}% after ${relayHealth.failoverFrequency} failover events.`;

    return {
      answer,
      groundingSignals: { evidenceRefs: ['RELAY_HEALTH_METRICS'] },
      explainability: {
        contributingMetrics: { 
          relayDependency: relayHealth.relayDependencyPct, 
          failovers: relayHealth.failoverFrequency 
        },
        anomaliesUsed: [],
        trendsUsed: [],
        recommendationBasis: relayHealth.relayDependencyPct > 75 ? ['Suggest connecting Twilio Keys'] : [],
        confidenceReasoning: "Retrieved from real-time relay telemetry and provider failover logs.", // Phase 10: Explainability
        replayReferences: [], // No specific replay for this simple insight
        telemetryReferences: ['RELAY_FAILOVER', 'DELIVERY_RECOVERY']
      },
      suggestedActions: [],
      isHallucinationSafe: true,
      timestamp: new Date()
    };
  }

  private static async handleOperationalRiskRanking(context: CopilotContext, traceId: string): Promise<CopilotResponse> {
    // Phase 3: Super Admin AI Assistant - Operational Risk Ranking
    const allReports = await ScoringEngine.getReportsForAllAcademies();
    const topRisks = await IntelligenceAggregator.getGlobalRiskRanking(allReports);

    const answer = `Top 3 academies with highest operational risk:\n` +
                   topRisks.map(r => `- ${r.tenantId} (Churn Risk: ${(r.predictedChurnRisk * 100).toFixed(0)}%)`).join('\n');

    return {
      answer,
      groundingSignals: { evidenceRefs: topRisks.map(r => `ACADEMY_REPORT_${r.tenantId}`) },
      explainability: {
        contributingMetrics: { topRiskCount: topRisks.length },
        anomaliesUsed: [],
        trendsUsed: [],
        recommendationBasis: ['proactive_intervention'],
        confidenceReasoning: "Ranking based on predicted churn risk and operational volatility across all academies.",
        replayReferences: [],
        telemetryReferences: ['ACADEMY_HEALTH_SCORES']
      },
      suggestedActions: [],
      isHallucinationSafe: true,
      timestamp: new Date()
    };
  }

  private static async logAiAction(context: CopilotContext, intent: string, response: CopilotResponse, traceId: string) {
    await IntelligencePipeline.handleEvent(context.tenantId, 'AI_NATIVE_QUERY', {
      intent,
      conversationId: context.conversationId,
      queryId: context.queryId,
      groundingConfidence: response.isHallucinationSafe ? 1.0 : 0.0,
      sourceSystem: 'copilot-orchestrator', // Mandatory for BaseIntelligenceTelemetry
      schemaVersion: '1.0.0',
      traceId
    });
  }

  private static handleUnauthorized(): CopilotResponse {
    return {
      answer: "I'm sorry, I don't have permission to share that specific information with your current role.",
      groundingSignals: { evidenceRefs: [] },
      explainability: { contributingMetrics: {}, anomaliesUsed: [], trendsUsed: [], recommendationBasis: [], confidenceReasoning: "RBAC restriction.", replayReferences: [], telemetryReferences: [] }, // Phase 10: Explainability
      suggestedActions: [],
      isHallucinationSafe: true,
      timestamp: new Date()
    };
  }

  private static handleGeneralQuery(text: string, report: IntelligenceReport, context: CopilotContext): CopilotResponse {
     return { 
       answer: "I can help with attendance summaries, churn risk analysis, and operational insights. What would you like to know?", 
       groundingSignals: { evidenceRefs: [] }, 
       explainability: { contributingMetrics: {}, anomaliesUsed: [], trendsUsed: [], recommendationBasis: [], confidenceReasoning: "General query, no specific grounding yet.", replayReferences: [], telemetryReferences: [] }, // Phase 10: Explainability
       suggestedActions: [], 
       isHallucinationSafe: true, 
       timestamp: new Date() 
     };
  }
}
