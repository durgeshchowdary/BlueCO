export type IntelligenceCategory = 'finance' | 'operations' | 'engagement' | 'delivery' | 'compliance' | 'platform';

/**
 * PHASE 10: Engineering Standards - Centralized Configuration
 * Prevents magic numbers and ensures consistent analytics logic platform-wide.
 */
export const INTELLIGENCE_CONFIG = {
  LOOKBACK: {
    WEEKLY_MS: 7 * 24 * 60 * 60 * 1000,
    MONTHLY_MS: 30 * 24 * 60 * 60 * 1000,
    DEFAULT_TIMELINE_DAYS: 30,
  },
  WEIGHTS: {
    FINANCE: 30,
    OPERATIONS: 20,
    ENGAGEMENT: 25,
    DELIVERY: 15,
    COMPLIANCE: 10,
    PLATFORM: 0,
  },
  THRESHOLDS: {
    CHURN_CRITICAL: 0.7,
    CHURN_WARNING: 0.4,
  }
};

export interface ScoreDetail {
  score: number;
  weight: number;
  label: string;
  reason: string;
  trend: 'improving' | 'declining' | 'stable';
  delta?: number; // Change since last snapshot
}

export interface IntelligenceSnapshot {
  timestamp: Date;
  overallHealthScore: number;
  categoryScores: Record<IntelligenceCategory, number>;
}

/**
 * PHASE 2: Event Contract Standardization
 * Enforces trace and tenant identity across all telemetry.
 */
export interface BaseIntelligenceTelemetry {
  tenantId: string;
  timestamp: Date;
  traceId?: string;
  sourceSystem: string; // e.g., 'scoring-engine', 'relay-service'
  schemaVersion: string; // e.g., '1.0.0'
}

export interface IntelligenceReport extends BaseIntelligenceTelemetry {
  overallHealthScore: number;
  categories: Record<IntelligenceCategory, ScoreDetail>;
  recommendations: Recommendation[];
  predictedChurnRisk: number; // 0 to 1
  dlt_status?: DltStatus;
  generatedAt: Date;
  trends: TrendSummary;
  anomalies: IntelligenceAnomaly[];
}

export interface IntelligenceTimelineEntry extends BaseIntelligenceTelemetry {
  id: string;
  type: 'anomaly' | 'score_change' | 'recommendation' | 'operational_event';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  metadata: Record<string, unknown>;
  sourceSystem: string;
  schemaVersion: string;
}

export interface CohortDefinition {
  id: string;
  name: string;
  category: IntelligenceCategory;
  criteria: (report: IntelligenceReport) => boolean;
  memberCount: number;
}

export interface LongitudinalInsight {
  period: 'daily' | 'weekly' | 'monthly';
  start: Date;
  end: Date;
  scoreMovement: number;
  volatility: number;
}

export interface IntelligenceEvent extends BaseIntelligenceTelemetry {
  eventType: IntelligenceEventType;
  severity: 'critical' | 'warning' | 'info';
  metadata: Record<string, unknown>;
  operationalContext?: string;
}

export interface TrendSummary {
  direction: 'up' | 'down' | 'flat';
  weeklyChange: number;
  monthlyChange: number;
  volatilityIndex: number; // 0 (stable) to 1 (highly volatile)
}

export interface IntelligenceAnomaly {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: IntelligenceCategory;
  message: string;
  evidence: Record<string, unknown>;
  detectedAt: Date;
  isResolved: boolean;
}

export type IntelligenceEventType = 
  // Attendance
  | 'ATTENDANCE_UPDATE' | 'ATTENDANCE_DROP' | 'ATTENDANCE_SPIKE' | 'REPEATED_ABSENCE' | 'BATCH_ATTENDANCE_DECLINE'
  // Predictive Intelligence
  | 'PREDICTION_GENERATED' | 'CHURN_FORECAST' | 'RELAY_INSTABILITY_PREDICTED' | 'ATTENDANCE_DEGRADATION_RISK'
  // Autonomous Operations
  | 'AUTONOMOUS_ACTION_GENERATED' | 'INTERVENTION_ESCALATED' | 'PLAYBOOK_EXECUTED' | 'AUTOMATION_COOLDOWN_TRIGGERED'
  // Self-Healing & Resilience
  | 'RECOVERY_STARTED' | 'RECOVERY_COMPLETED' | 'RECOVERY_FAILED' | 'DEGRADED_MODE_ACTIVATED' | 'DEGRADED_MODE_DEACTIVATED' | 'REPLAY_RECONSTRUCTION_TRIGGERED' | 'WAREHOUSE_RECONCILIATION_STARTED'
  // Distributed Resilience
  | 'DISTRIBUTED_CONSISTENCY_VALIDATED' | 'REPLAY_CHECKSUM_MISMATCH' | 'WAREHOUSE_PARTITION_RECOVERED' | 'FAILOVER_PROPAGATED' | 'TELEMETRY_DRIFT_DETECTED'
  // Chaos Engineering & Verification
  | 'CHAOS_SIMULATION_STARTED' | 'CHAOS_SIMULATION_COMPLETED' | 'CHAOS_SIMULATION_FAILED' | 'CORRECTNESS_AUDIT_COMPLETED' | 'REPLAY_INTEGRITY_VERIFIED'
  // Platform Governance & Trust
  | 'PLATFORM_TRUST_SCORE_GENERATED' | 'GOVERNANCE_AUDIT_TRIGGERED' | 'COMPLIANCE_VIOLATION_DETECTED' | 'RBAC_VIOLATION_DETECTED' | 'TENANT_ISOLATION_BREACH'
  // DLT / Compliance Lifecycle
  | 'DLT_SUBMITTED' | 'DLT_UNDER_REVIEW' | 'DLT_APPROVED' | 'DLT_REJECTED' | 'DLT_REUPLOAD_REQUESTED'
  // Relay Intelligence
  | 'RELAY_THRESHOLD_ALERT' | 'RELAY_FAILOVER_SPIKE' | 'RELAY_DIGEST_GENERATED' | 'RELAY_SATURATION_WARNING'
  // Relay / Delivery
  | 'DELIVERY_FAILURE' | 'RELAY_FAILOVER' | 'REPEATED_DELIVERY_FAILURE' | 'PROVIDER_INSTABILITY' | 'DELIVERY_RECOVERY'
  // Billing / Finance
  | 'INVOICE_PAID' | 'INVOICE_OVERDUE' | 'REPEATED_PAYMENT_FAILURE' | 'BILLING_RECOVERY' | 'CHURN_RISK_SIGNAL'
  // Login / Activity
  | 'LOGIN_ACTIVITY' | 'COACH_ACTIVITY' | 'INACTIVITY_SPIKE' | 'ADMIN_INACTIVE' | 'COACH_INACTIVE' | 'ENGAGEMENT_DECLINE'
  // Automation
  | 'AUTOMATION_ERROR' | 'AUTOMATION_FAILURE' | 'RETRY_SPIKE' | 'DEAD_LETTER_GROWTH' | 'REPAIR_SUCCESS' | 'AI_NATIVE_QUERY'
  // Compliance
  | 'COMPLIANCE_UPLOAD' | 'COMPLIANCE_COMPLETED' | 'COMPLIANCE_MISSING' | 'REPEATED_UPLOAD_FAILURE' | 'DLT_REJECTION';

export type DltStatus = 'pending' | 'partial' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface RelayMetrics {
  totalRelayedMessages: number;
  relayDependencyPct: number;
  ownKeyAdoptionPct: number;
  failoverFrequency: number;
  recoveryRate: number;
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionLink?: string;
  impactArea: IntelligenceCategory;
  rationale: string;
}

export interface CopilotContext {
  tenantId: string;
  userRole: 'super_admin' | 'academy_owner' | 'coach' | 'parent';
  relevantReport?: IntelligenceReport;
  recentTimeline?: IntelligenceTimelineEntry[];
  activeAnomalies?: IntelligenceAnomaly[];
  conversationId: string;
  queryId: string;
}

export interface CopilotExplainability {
  contributingMetrics: Record<string, number>;
  anomaliesUsed: string[];
  trendsUsed: string[];
  recommendationBasis: string[];
  confidenceReasoning: string;
  replayReferences: string[];
  telemetryReferences: string[];
}

export interface CopilotResponse {
  answer: string;
  groundingSignals: {
    score?: number;
    trendDirection?: 'up' | 'down' | 'flat';
    evidenceRefs: string[]; // IDs of anomalies or timeline entries
  };
  explainability: CopilotExplainability;
  suggestedActions: Recommendation[];
  isHallucinationSafe: boolean; // Flag based on grounding data availability
  timestamp: Date;
}

export interface ForecastExplainability {
  historicalPatterns: string;
  anomaliesUsed: string[];
  replayReferences: string[];
  telemetryReferences: string[];
  confidenceReasoning: string;
  trendBasis: string;
}

export interface PredictiveForecast extends BaseIntelligenceTelemetry {
  predictionId: string;
  forecastWindow: '7d' | '30d';
  currentRisk: number;
  predictedRisk: number;
  contributingSignals: string[];
  confidenceScore: number; // 0 to 1
  forecastDirection: 'improving' | 'declining' | 'stable';
  operationalRecommendations: Recommendation[];
  explainability: ForecastExplainability;
  category: IntelligenceCategory;
}

export interface DecisionExplainability {
  triggeringForecasts: string[];
  anomaliesUsed: string[];
  telemetryUsed: string[];
  replayReferences: string[];
  warehouseReferences: string[];
  confidenceReasoning: string;
  interventionRationale: string;
  operationalImpact: string;
}

export interface AutonomousAction extends BaseIntelligenceTelemetry {
  interventionId: string;
  actionType: 'NOTIFY_OWNER' | 'ESCALATE_ALERT' | 'CREATE_TASK' | 'SCHEDULE_REVIEW' | 'TRIGGER_COACH_REMINDER';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending_approval' | 'executed' | 'suppressed' | 'failed';
  forecastReferences: string[];
  explainability: DecisionExplainability;
  playbookReference?: string;
}

export interface OperationalPlaybook {
  id: string;
  title: string;
  steps: string[];
  recoveryGuidance: string;
  escalationProcedure: string;
  evidence: {
    telemetry: string[];
    replayTraces: string[];
  };
}

export interface RecoveryExplainability {
  triggeringIncidents: string[];
  anomaliesUsed: string[];
  telemetryUsed: string[];
  replayReferences: string[];
  warehouseReferences: string[];
  recoveryRationale: string;
  degradationImpact: string;
  expectedRecoveryOutcome: string;
  operationalRisk: 'low' | 'medium' | 'high';
}

export interface RecoveryAction extends BaseIntelligenceTelemetry {
  recoveryId: string;
  type: 'REPLAY_REBUILD' | 'CACHE_INVALIDATION' | 'RETRY_REBALANCE' | 'RELAY_FAILOVER' | 'TELEMETRY_RESYNC' | 'DEGRADED_MODE_TOGGLE';
  status: 'active' | 'completed' | 'failed' | 'suppressed';
  incidentReferences: string[];
  explainability: RecoveryExplainability;
  outcome?: string;
}

export interface ResilienceStatus {
  tenantId: string;
  isDegraded: boolean;
  activeRecoveryIds: string[];
  lastHealthCheck: Date;
  subsystems: {
    relay: 'stable' | 'degraded' | 'recovering';
    warehouse: 'stable' | 'degraded' | 'recovering';
    replay: 'stable' | 'degraded' | 'recovering';
    automation: 'stable' | 'degraded' | 'recovering';
  };
}

export interface ReplayChecksum {
  partitionId: string;
  lastEventId: string;
  checksum: string;
  eventCount: number;
  timestamp: Date;
}

export interface ConsistencyReport extends BaseIntelligenceTelemetry {
  replayConsistencyScore: number;
  warehouseIntegrityScore: number;
  telemetryIntegrityScore: number;
  failoverStabilityScore: number;
  partitionId: string;
  divergenceDetected: boolean;
}

export interface DistributedFailoverContext {
  sourceProvider: string;
  targetProvider: string;
  reason: string;
  affectedTenantIds: string[];
}

export interface ChaosSimulation extends BaseIntelligenceTelemetry {
  simulationId: string;
  type: 'RELAY_OUTAGE' | 'WAREHOUSE_DRIFT' | 'REPLAY_CORRUPTION' | 'RETRY_STORM';
  status: 'running' | 'completed' | 'failed';
  impactRadius: 'tenant' | 'partition' | 'global';
  governanceGated: boolean;
}

export interface OperationalCorrectnessScore {
  replayCorrectness: number;
  failoverCorrectness: number;
  telemetryCorrectness: number;
  warehouseCorrectness: number;
  resilienceConfidence: number;
  auditTimestamp: Date;
}

export interface VerificationAudit extends BaseIntelligenceTelemetry {
  auditId: string;
  targetSystem: string;
  result: 'pass' | 'fail' | 'warning';
  score: number;
  evidence: Record<string, unknown>;
}

export interface TrustExplainability {
  governanceRulesApplied: string[];
  auditReferences: string[];
  correctnessScoresUsed: OperationalCorrectnessScore;
  complianceStatus: DltStatus;
  replayVerificationTraces: string[];
  confidenceReasoning: string;
  operationalRiskFactors: string[];
}

export interface PlatformTrustScore extends BaseIntelligenceTelemetry {
  trustScoreId: string;
  overallTrustScore: number; // 0-100
  complianceScore: number;
  resilienceTrustScore: number;
  securityTrustScore: number;
  dataIntegrityTrustScore: number;
  explainability: TrustExplainability;
  recommendations: Recommendation[];
}

export interface GovernanceAudit extends BaseIntelligenceTelemetry {
  auditId: string;
  type: 'RBAC_CHECK' | 'TENANT_ISOLATION_CHECK' | 'DATA_INTEGRITY_CHECK' | 'COMPLIANCE_CHECK';
  result: 'pass' | 'fail';
  details: Record<string, unknown>;
}
