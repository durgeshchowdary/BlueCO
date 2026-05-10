export type Role = 'super_admin' | 'academy_admin' | 'coach' | 'employee' | 'student';

export const roleHome: Record<Role, string> = {
  super_admin: '/super-admin/dashboard',
  academy_admin: '/academy/dashboard',
  coach: '/coach/dashboard',
  employee: '/employee/dashboard',
  student: '/dashboard',
};

export const roleLabels: Record<Role, string> = {
  super_admin: 'Super Admin',
  academy_admin: 'Academy Admin',
  coach: 'Coach',
  employee: 'Employee',
  student: 'Student',
};

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('playgrid_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem('playgrid_user');
    return null;
  }
}

export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  const legacyAuth = localStorage.getItem('isAuthenticated');
  const token = localStorage.getItem('playgrid_token');

  if (!legacyAuth && token) {
    localStorage.setItem('isAuthenticated', 'true');
  }

  return legacyAuth === 'true' || Boolean(token);
}

export function logout() {
  localStorage.removeItem('playgrid_token');
  localStorage.removeItem('playgrid_user');
  localStorage.removeItem('playgrid_role');
  localStorage.removeItem('playgrid_permissions');
  localStorage.removeItem('isAuthenticated');
  document.cookie = 'pg_role=; Max-Age=0; path=/';
  document.cookie = 'pg_token=; Max-Age=0; path=/';
  document.cookie = 'pg_permissions=; Max-Age=0; path=/';
  window.location.href = '/login';
}
