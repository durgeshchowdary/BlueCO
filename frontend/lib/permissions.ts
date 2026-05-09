export const permissions = {
  paymentsRead: 'payments:read',
  ticketsRead: 'tickets:read',
  admissionsRead: 'admissions:read',
  reportsRead: 'reports:read',
  studentsRead: 'students:read',
  batchesRead: 'batches:read',
  attendanceRead: 'attendance:read',
  performanceWrite: 'performance:write',
  tasksRead: 'tasks:read',
  profileRead: 'profile:read',
  scheduleRead: 'schedule:read',
} as const;

export function can(userPermissions: string[] = [], required?: string) {
  if (!required) return true;
  return userPermissions.includes('*') || userPermissions.includes(required);
}
