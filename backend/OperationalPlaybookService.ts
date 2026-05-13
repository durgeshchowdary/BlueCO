import { IntelligenceCategory, OperationalPlaybook } from './intelligence'; // Adjusted path

export class OperationalPlaybookService {
  /**
   * Section 8: Operational Playbook Engine.
   * Maps incident categories to structured recovery guidance.
   */
  public static getPlaybookForCategory(category: IntelligenceCategory): OperationalPlaybook {
    const playbooks: Record<string, OperationalPlaybook> = {
      delivery: {
        id: 'PB_RELAY_RECOVERY',
        title: 'Relay Instability Recovery',
        steps: [
          'Validate Twilio Provider status',
          'Analyze recent Failover clusters in Warehouse',
          'Switch Academy to Dedicated Sender ID'
        ],
        recoveryGuidance: 'High dependency on platform relay detected. Migrate to own keys to bypass platform-wide congestion.',
        escalationProcedure: 'Notify Platform Reliability Lead if failover frequency > 10/hr.',
        evidence: { telemetry: ['RELAY_FAILOVER'], replayTraces: ['DELIVERY_PIPELINE'] }
      },
      operations: {
        id: 'PB_CHURN_MITIGATION',
        title: 'Churn Prevention Playbook',
        steps: [
          'Audit last 30 days of login activity',
          'Identify student participation drops',
          'Trigger Owner Engagement Session'
        ],
        recoveryGuidance: 'Operational risk is high due to engagement decay. Prioritize manual academy review.',
        escalationProcedure: 'Escalate to Customer Success if churn-risk > 0.8.',
        evidence: { telemetry: ['ENGAGEMENT_DECLINE'], replayTraces: ['ACADEMY_SNAPSHOTS'] }
      }
    };

    return playbooks[category] ?? playbooks.operations!;
  }
}
