export type NotificationCategory =
  | 'operational'
  | 'billing'
  | 'attendance'
  | 'aiops'
  | 'system';

export type NotificationVariant =
  | 'success'
  | 'warning'
  | 'info'
  | 'anomaly';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  variant: NotificationVariant;
  read: boolean;
  createdAt: number;
}   