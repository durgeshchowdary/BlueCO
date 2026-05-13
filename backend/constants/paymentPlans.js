const SUBSCRIPTION_PLANS = {
  pro: {
    id: 'pro',
    name: 'Pro',
    amount: 99900,
    currency: 'INR',
    interval: 'month',
    checkoutEnabled: true,
    features: ['unlimited_students', 'attendance', 'payroll', 'invoices', 'analytics', 'automation'],
  },
  legend: {
    id: 'legend',
    name: 'Legend',
    amount: null,
    currency: 'INR',
    interval: 'custom',
    checkoutEnabled: false,
    features: ['ai_studio', 'video_analysis', 'arena_x', 'ai_analytics_suite', 'custom_success'],
  },
};

const getSubscriptionPlan = (plan) => {
  const planId = String(plan || '').trim().toLowerCase();
  return SUBSCRIPTION_PLANS[planId] || null;
};

export {
  SUBSCRIPTION_PLANS,
  getSubscriptionPlan,
};
