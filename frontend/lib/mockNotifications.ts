import type { NotificationItem } from '@/types/notifications';

const now = Date.now();

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'AI Ops anomaly detected',
    message: 'Attendance dropped below the expected range for Evening Batch A.',
    category: 'aiops',
    variant: 'anomaly',
    read: false,
    createdAt: now - 1000 * 60 * 8,
  },
  {
    id: 'notif-2',
    title: 'Payment reminder pending',
    message: '3 student fee reminders are waiting for follow-up.',
    category: 'billing',
    variant: 'warning',
    read: false,
    createdAt: now - 1000 * 60 * 24,
  },
  {
    id: 'notif-3',
    title: 'Attendance synced',
    message: 'Today’s coach and student attendance has been updated.',
    category: 'attendance',
    variant: 'success',
    read: true,
    createdAt: now - 1000 * 60 * 45,
  },
  {
    id: 'notif-4',
    title: 'Operational health stable',
    message: 'No critical system issues detected in the last hour.',
    category: 'operational',
    variant: 'info',
    read: true,
    createdAt: now - 1000 * 60 * 70,
  },
];