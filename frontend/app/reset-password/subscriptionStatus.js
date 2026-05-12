export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  TRIAL: 'trial',
  EXPIRING: 'expiring',
  OVERDUE: 'overdue',
  SUSPENDED: 'suspended',
};

export const getStatusLabel = (status) => {
  const labels = {
    [SUBSCRIPTION_STATUS.ACTIVE]: 'Active',
    [SUBSCRIPTION_STATUS.TRIAL]: 'Free Trial',
    [SUBSCRIPTION_STATUS.EXPIRING]: 'Expiring Soon',
    [SUBSCRIPTION_STATUS.OVERDUE]: 'Payment Overdue',
    [SUBSCRIPTION_STATUS.SUSPENDED]: 'Suspended',
  };
  return labels[status] || 'Unknown';
};