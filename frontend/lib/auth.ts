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

const AUTH_MAX_AGE = 60 * 60 * 10;
const STORAGE_PREFIX = 'outplay';
const LEGACY_STORAGE_PREFIX = ['play', 'grid'].join('');

const storageKey = (name: string) => `${STORAGE_PREFIX}_${name}`;
const legacyStorageKey = (name: string) => `${LEGACY_STORAGE_PREFIX}_${name}`;

function getStoredValue(name: string) {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(storageKey(name)) || localStorage.getItem(legacyStorageKey(name));
}

function setStoredValue(name: string, value: string) {
  localStorage.setItem(storageKey(name), value);
  localStorage.setItem(legacyStorageKey(name), value);
}

function removeStoredValue(name: string) {
  localStorage.removeItem(storageKey(name));
  localStorage.removeItem(legacyStorageKey(name));
}

function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
  return value ? decodeURIComponent(value) : null;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${AUTH_MAX_AGE}; SameSite=Lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null;

  return (
    getStoredValue('token') ||
    getCookie('pg_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('pg_token') ||
    localStorage.getItem('outplay_token')
  );
}

export function getStoredRole(): Role | null {
  if (typeof window === 'undefined') return null;
  const role = getStoredValue('role') || getCookie('pg_role');
  return role && role in roleLabels ? (role as Role) : null;
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const raw = getStoredValue('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    removeStoredValue('user');
    return null;
  }
}

export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  const legacyAuth = localStorage.getItem('isAuthenticated');
  const token = getAuthToken();

  if (!legacyAuth && token) {
    localStorage.setItem('isAuthenticated', 'true');
  }

  return legacyAuth === 'true' || Boolean(token);
}

export function setAuthSession({
  token,
  user,
  role,
  permissions,
}: {
  token: string;
  user: Record<string, unknown>;
  role: Role;
  permissions: string[];
}) {
  if (typeof window === 'undefined') return;

  setStoredValue('token', token);
  setStoredValue('user', JSON.stringify(user));
  setStoredValue('role', role);
  setStoredValue('permissions', JSON.stringify(permissions));
  localStorage.setItem('isAuthenticated', 'true');
  setCookie('pg_role', role);
  setCookie('pg_token', token);
  setCookie('pg_permissions', permissions.join(','));
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;

  removeStoredValue('token');
  removeStoredValue('user');
  removeStoredValue('role');
  removeStoredValue('permissions');
  localStorage.removeItem('isAuthenticated');
  clearCookie('pg_role');
  clearCookie('pg_token');
  clearCookie('pg_permissions');
}

export function logout() {
  clearAuthSession();
  window.location.href = '/login';
}
