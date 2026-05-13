import { Recommendation, IntelligenceCategory, ScoreDetail } from './intelligence'; // Use .js extension for local imports

export class RecommendationEngine {
  /**
   * Generates actionable insights based on score anomalies.
   */
  public static getRecommendations(categories: Record<IntelligenceCategory, ScoreDetail>): Recommendation[] {
    const recs: Recommendation[] = [];

    if (categories.delivery && categories.delivery.score < 70) {
      recs.push({
        id: `REC_DEL_${Date.now()}`,
        priority: 'high',
        title: 'High Relay Dependency Detected',
        description: 'Your message delivery reliability is dropping. We recommend connecting your own Twilio SID.',
        impactArea: 'delivery',
        rationale: 'Self-hosted keys bypass shared relay congestion.'
      });
    }

    if (categories.engagement && categories.engagement.score < 50) {
      recs.push({
        id: `REC_ENG_${Date.now()}`,
        priority: 'medium',
        title: 'Low Parent Engagement',
        description: 'Attendance notifications show low open rates in your U14 batch.',
        impactArea: 'engagement',
        actionLink: '/dashboard/batches/u14',
        rationale: 'WhatsApp-first delivery increases open rates by 40% based on platform trends.'
      });
    }

    return recs;
  }
}