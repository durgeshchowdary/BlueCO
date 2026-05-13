/**
 * backend/services/reportAggregationService.js
 * Lightweight service to normalize and aggregate operational metrics for executive reports.
 */

export const aggregateOperationalMetrics = (data) => {
  if (!data) return null;

  // Normalize attendance, payments, and AI anomalies into summary groups
  return {
    summary: {
      attendance: calculateAverage(data.attendance),
      revenue: sumValues(data.payments),
      anomalies: data.aiLogs?.filter(log => log.severity === 'high').length || 0,
    },
    trends: groupDataByPeriod(data.history || [], 'month'),
    healthScore: calculateHealthScore(data)
  };
};

const calculateAverage = (items = []) => {
  if (!items.length) return 0;
  const sum = items.reduce((acc, curr) => acc + (curr.value || 0), 0);
  return Math.round(sum / items.length);
};

const sumValues = (items = []) => {
  return items.reduce((acc, curr) => acc + (curr.amount || 0), 0);
};

const calculateHealthScore = (data) => {
  // Simple weighted logic for demo/recruiter impact
  const attendanceFactor = calculateAverage(data.attendance) * 0.4;
  const paymentFactor = (data.payments?.length > 0 ? 100 : 0) * 0.4;
  const anomalyFactor = Math.max(0, 100 - (data.aiLogs?.length || 0) * 5) * 0.2;
  
  return Math.round(attendanceFactor + paymentFactor + anomalyFactor);
};

const groupDataByPeriod = (data, period) => {
  const groups = {};
  data.forEach(item => {
    const date = new Date(item.createdAt);
    const key = period === 'month' 
      ? `${date.getFullYear()}-${date.getMonth() + 1}`
      : date.toISOString().split('T')[0];
    
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
};