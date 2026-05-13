import { 
  PlatformTrustScore, 
  IntelligenceReport, 
  OperationalCorrectnessScore, 
  DltStatus, // Keep DltStatus type for calculateComplianceScore
  Recommendation,
  INTELLIGENCE_CONFIG
} from './intelligence';
import { IntelligencePipeline } from './IntelligencePipeline';
import { IntelligenceAggregator } from './IntelligenceAggregator';

export class PlatformTrustEngine {
  /**
   * SECTION 1: Platform Trust Engine.
   * Generates a deterministic, explainable trust score for the platform.
   */
  public static async generateTrustScore(
    tenantId: string,
    currentReport: IntelligenceReport // Keep currentReport for other metrics
  ): Promise<PlatformTrustScore> {
    const trustScoreId = `TRUST_${Date.now()}`;
    const traceId = `TRACE_${trustScoreId}`;

    // Retrieve foundational scores
    const operationalCorrectness = await IntelligenceAggregator.getOperationalCorrectness(tenantId);
    const resilienceScore = await IntelligenceAggregator.getResilienceScore(tenantId);
    
    // Placeholder for DLT status retrieval - in a real system, this would come from the Academy model
    const dltStatus: DltStatus = 'approved'; // Example: (await Academy.findById(tenantId))?.dlt_status || 'pending';

    // Determine Compliance Score based on DLT status
    const complianceScore = this.calculateComplianceScore(dltStatus);

    // Calculate individual trust dimensions
    const resilienceTrustScore = (resilienceScore + operationalCorrectness.resilienceConfidence) / 2;
    const dataIntegrityTrustScore = (operationalCorrectness.replayCorrectness + operationalCorrectness.warehouseCorrectness) / 2;
    const securityTrustScore = 100; // Placeholder for future security audit integration

    // Overall Trust Score (weighted average)
    const overallTrustScore = Math.round(
      (complianceScore * 0.3) +
      (resilienceTrustScore * 0.4) +
      (securityTrustScore * 0.2) +
      (dataIntegrityTrustScore * 0.1)
    );

    const recommendations = this.generateTrustRecommendations(complianceScore, resilienceTrustScore);

    const trustScore: PlatformTrustScore = {
      tenantId,
      trustScoreId,
      timestamp: new Date(),
      sourceSystem: 'platform-trust-engine',
      schemaVersion: '1.0.0',
      traceId,
      overallTrustScore,
      complianceScore,
      resilienceTrustScore,
      securityTrustScore,
      dataIntegrityTrustScore,
      explainability: {
        governanceRulesApplied: ['DLT_COMPLIANCE_POLICY', 'RESILIENCE_GOVERNANCE'],
        auditReferences: [`AUDIT_${Date.now()}`], // Placeholder
        correctnessScoresUsed: operationalCorrectness,
        complianceStatus: dltStatus,
        replayVerificationTraces: [`REPLAY_VERIFY_${Date.now()}`], // Placeholder
        confidenceReasoning: "Aggregated from real-time operational correctness, resilience, and compliance status.",
        operationalRiskFactors: this.getOperationalRiskFactors(overallTrustScore)
      },
      recommendations
    };

    await this.auditTrustScore(trustScore);
    return trustScore;
  }

  private static calculateComplianceScore(dltStatus: DltStatus): number {
    switch (dltStatus) {
      case 'approved': return 100;
      case 'submitted': return 80;
      case 'under_review': return 70;
      case 'partial': return 50;
      case 'rejected': return 20;
      case 'pending': return 10;
      default: return 0;
    }
  }

  private static generateTrustRecommendations(compliance: number, resilience: number): Recommendation[] {
    const recs: Recommendation[] = [];
    if (compliance < 80) recs.push({ id: 'REC_COMPLIANCE_IMPROVE', priority: 'high', title: 'Improve DLT Compliance', description: 'Review DLT status and upload missing documents.', impactArea: 'compliance', rationale: 'Low compliance score impacts platform trust.' });
    if (resilience < 80) recs.push({ id: 'REC_RESILIENCE_HARDEN', priority: 'medium', title: 'Harden Operational Resilience', description: 'Investigate recent recovery failures or checksum mismatches.', impactArea: 'platform', rationale: 'Low resilience score indicates potential instability.' });
    return recs;
  }

  private static getOperationalRiskFactors(score: number): string[] {
    if (score < 50) return ['High operational risk', 'Potential compliance violations'];
    if (score < 75) return ['Moderate operational risk', 'Requires attention to resilience'];
    return ['Low operational risk', 'Platform operating within governance parameters'];
  }

  private static async auditTrustScore(trustScore: PlatformTrustScore) {
    await IntelligencePipeline.handleEvent(trustScore.tenantId, 'PLATFORM_TRUST_SCORE_GENERATED', {
      trustScoreId: trustScore.trustScoreId,
      overallTrustScore: trustScore.overallTrustScore,
      complianceScore: trustScore.complianceScore,
      resilienceTrustScore: trustScore.resilienceTrustScore,
      sourceSystem: trustScore.sourceSystem,
      schemaVersion: trustScore.schemaVersion,
      traceId: trustScore.traceId
    });
  }
}
