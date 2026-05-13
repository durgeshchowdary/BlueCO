import { IntelligenceSnapshot, TrendSummary, IntelligenceCategory, INTELLIGENCE_CONFIG } from './intelligence';

export class TrendEngine {
  /**
   * Analyzes score movement between snapshots.
   */
  public static calculateTrend(
    currentScore: number,
    history: IntelligenceSnapshot[]
  ): TrendSummary {
    if (history.length === 0) {
      return { direction: 'flat', weeklyChange: 0, monthlyChange: 0, volatilityIndex: 0 };
    }

    const sevenDaysAgo = Date.now() - INTELLIGENCE_CONFIG.LOOKBACK.WEEKLY_MS;
    const lastWeekSnapshot = history.find(s => s.timestamp.getTime() <= sevenDaysAgo);

    const thirtyDaysAgo = Date.now() - INTELLIGENCE_CONFIG.LOOKBACK.MONTHLY_MS;
    const lastMonthSnapshot = history.find(s => s.timestamp.getTime() <= thirtyDaysAgo);

    const weeklyChange = lastWeekSnapshot ? currentScore - lastWeekSnapshot.overallHealthScore : 0;
    const monthlyChange = lastMonthSnapshot ? currentScore - lastMonthSnapshot.overallHealthScore : 0;

    return {
      direction: weeklyChange > 2 ? 'up' : weeklyChange < -2 ? 'down' : 'flat',
      weeklyChange,
      monthlyChange,
      volatilityIndex: this.calculateVolatility(history)
    };
  }

  private static calculateVolatility(history: IntelligenceSnapshot[]): number {
    if (history.length < 3) return 0;
    const scores = history.slice(-10).map(s => s.overallHealthScore);
    const mean = scores.reduce((a, b) => a + b) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    return Math.min(1, Math.sqrt(variance) / 20); // Normalized to 0-1
  }

  public static getCategoryDelta(
    category: IntelligenceCategory,
    current: number,
    previous?: IntelligenceSnapshot
  ): number {
    if (!previous) return 0;
    return current - (previous.categoryScores[category] || current);
  }
}