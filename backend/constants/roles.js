const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ACADEMY_ADMIN: 'academy_admin',
  COACH: 'coach',
  EMPLOYEE: 'employee',
  STUDENT: 'student',
});

const EMPLOYEE_TYPES = Object.freeze({
  RECEPTIONIST: 'receptionist',
  ACCOUNTANT: 'accountant',
  SUPPORT_STAFF: 'support_staff',
  ANALYST: 'analyst',
  GROUND_STAFF: 'ground_staff',
  MANAGER: 'manager',
});

const ROLE_HOME = Object.freeze({
  [ROLES.SUPER_ADMIN]: '/super-admin/dashboard',
  [ROLES.ACADEMY_ADMIN]: '/academy/dashboard',
  [ROLES.COACH]: '/coach/dashboard',
  [ROLES.EMPLOYEE]: '/employee/dashboard',
  [ROLES.STUDENT]: '/dashboard',
});

module.exports = { ROLES, EMPLOYEE_TYPES, ROLE_HOME };
