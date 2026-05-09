const { ROLES } = require('../constants/roles');
const {
  ACADEMY_ADMIN_PERMISSIONS,
  COACH_PERMISSIONS,
  EMPLOYEE_TYPE_PERMISSIONS,
} = require('../constants/permissions');

const unique = (items) => [...new Set((items || []).filter(Boolean))];

const getEffectivePermissions = (user = {}) => {
  if (user.role === ROLES.SUPER_ADMIN) return ['*'];
  if (user.role === ROLES.ACADEMY_ADMIN) {
    return unique([...ACADEMY_ADMIN_PERMISSIONS, ...(user.permissions || [])]);
  }
  if (user.role === ROLES.COACH) {
    return unique([...COACH_PERMISSIONS, ...(user.permissions || [])]);
  }
  if (user.role === ROLES.EMPLOYEE) {
    return unique([
      ...(EMPLOYEE_TYPE_PERMISSIONS[user.employeeType] || []),
      ...(user.permissions || []),
    ]);
  }
  return unique(user.permissions || []);
};

const hasPermission = (user, permission) => {
  const effective = user?.effectivePermissions || getEffectivePermissions(user);
  return effective.includes('*') || effective.includes(permission);
};

const hasAnyPermission = (user, permissions = []) => {
  const effective = user?.effectivePermissions || getEffectivePermissions(user);
  return effective.includes('*') || permissions.some((permission) => effective.includes(permission));
};

module.exports = { getEffectivePermissions, hasPermission, hasAnyPermission };
