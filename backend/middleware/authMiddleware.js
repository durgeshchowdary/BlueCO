import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { ROLES } from '../constants/roles.js';
import { verify } from '../utils/auth.js';
import { getEffectivePermissions, hasPermission, hasAnyPermission } from '../utils/permissions.js';
import logger from '../services/logger.js';
import observability from '../services/observabilityService.js';
import process from 'node:process';

const jwtSecret = () => process.env.JWT_SECRET || 'playgrid-local-dev-secret-change-me';

const forbidden = (res, message = 'Access Denied') => res.status(403).json({ message });

/**
 * @typedef {object} CustomUser
 * @property {string} _id
 * @property {string} academyId
 * @property {string} role
 * @property {string[]} assignedStudents
 * @property {string[]} assignedBatches
 * @property {string[]} effectivePermissions
 */

const authenticateUser = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      observability.increment('authFailures', { route: req.originalUrl, reason: 'missing_token' });
      logger.warn('auth.failure', { category: 'auth', route: req.originalUrl, reason: 'missing_token' });
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payload = verify(token, jwtSecret());
    const user = await User.findById(payload.sub).select('-passwordHash').lean();
    if (!user || !user.isActive) {
      observability.increment('authFailures', { route: req.originalUrl, reason: 'inactive_or_missing_user' });
      logger.warn('auth.failure', { category: 'auth', route: req.originalUrl, reason: 'inactive_or_missing_user', userId: payload.sub });
      return forbidden(res, 'Access Denied');
    }

    user.effectivePermissions = getEffectivePermissions(user);
    req.user = /** @type {CustomUser} */ (user);
    req.auth = payload;
    logger.setContext({
      academyId: user.academyId ? String(user.academyId) : undefined,
      userId: user._id ? String(user._id) : undefined,
      userRole: user.role,
    });
    next();
  } catch (error) {
    observability.increment('authFailures', { route: req.originalUrl, reason: 'invalid_or_expired_token' });
    logger.warn('auth.failure', { category: 'auth', route: req.originalUrl, reason: 'invalid_or_expired_token', error });
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(/** @type {CustomUser} */ (req.user).role)) {
    observability.increment('rbacDenials', { route: req.originalUrl, expectedRoles: roles, actualRole: req.user?.role });
    logger.warn('rbac.denied', { category: 'security', route: req.originalUrl, expectedRoles: roles, actualRole: req.user?.role });
    return forbidden(res);
  }
  next();
};

const requireSuperAdmin = () => requireRole(ROLES.SUPER_ADMIN);
const requireAcademyAdmin = () => requireRole(ROLES.ACADEMY_ADMIN);
const requireCoach = () => requireRole(ROLES.COACH);
const requireEmployee = () => requireRole(ROLES.EMPLOYEE);

const requirePermission = (permission) => (req, res, next) => {
  const legacyPrefixes = [
    '/api/students',
    '/api/coaches',
    '/api/batches',
    '/api/attendance',
    '/api/payments',
    '/api/events',
    '/api/dashboard',
    '/api/tickets',
    '/api/announcements',
  ];

  if (legacyPrefixes.some((prefix) => req.originalUrl === prefix || req.originalUrl.startsWith(`${prefix}/`))) {
    return next();
  }

  if (!hasPermission(/** @type {CustomUser} */ (req.user), permission)) {
    observability.increment('rbacDenials', { route: req.originalUrl, permission, actualRole: req.user?.role });
    logger.warn('rbac.denied', { category: 'security', route: req.originalUrl, permission, actualRole: req.user?.role });
    return forbidden(res);
  }
  next();
};

const requireAnyPermission = (...permissions) => (req, res, next) => {
  if (!hasAnyPermission(/** @type {CustomUser} */ (req.user), permissions)) {
    observability.increment('rbacDenials', { route: req.originalUrl, permissions, actualRole: req.user?.role });
    logger.warn('rbac.denied', { category: 'security', route: req.originalUrl, permissions, actualRole: req.user?.role });
    return forbidden(res);
  }
  next();
};

const requireAcademyAccess = (req, res, next) => {
  if (/** @type {CustomUser} */ (req.user)?.role === ROLES.SUPER_ADMIN) return next();
  if (!/** @type {CustomUser} */ (req.user)?.academyId) {
    observability.increment('rbacDenials', { route: req.originalUrl, reason: 'missing_academy_scope' });
    logger.warn('rbac.denied', { category: 'security', route: req.originalUrl, reason: 'missing_academy_scope' });
    return forbidden(res);
  }

  const requestedAcademyId = req.params.academyId || req.query.academyId || req.body?.academyId;
  if (requestedAcademyId && String(requestedAcademyId) !== String(/** @type {CustomUser} */ (req.user).academyId)) {
    observability.increment('rbacDenials', { route: req.originalUrl, reason: 'tenant_scope_mismatch' });
    logger.warn('rbac.tenant_scope_mismatch', {
      category: 'security',
      route: req.originalUrl,
      requestedAcademyId,
      academyId: String(/** @type {CustomUser} */ (req.user).academyId),
    });
    return forbidden(res);
  }

  req.academyId = /** @type {CustomUser} */ (req.user).academyId;
  next();
};
const requireAcademyScope = requireAcademyAccess;

const requireAssignedStudent = (paramName = 'studentId') => (req, res, next) => {
  if (/** @type {CustomUser} */ (req.user)?.role !== ROLES.COACH) return next();
  const studentId = req.params[paramName] || req.body?.studentId || req.body?._id;
  if (!studentId) return next();
  if (!(/** @type {CustomUser} */ (req.user).assignedStudents || []).some((id) => String(id) === String(studentId))) {
    return forbidden(res);
  }
  next();
};

const requireAssignedBatch = (paramName = 'batchId') => (req, res, next) => {
  if (/** @type {CustomUser} */ (req.user)?.role !== ROLES.COACH) return next();
  const batchId = req.params[paramName] || req.body?.batchId || req.body?._id;
  if (!batchId) return next();
  if (!(/** @type {CustomUser} */ (req.user).assignedBatches || []).some((id) => String(id) === String(batchId))) {
    return forbidden(res);
  }
  next();
};

const audit = (action, targetType = '') => async (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      AuditLog.create({ // Use .js extension for local imports
        actorId: /** @type {CustomUser} */ (req.user)?._id || null,
        actorRole: /** @type {CustomUser} */ (req.user)?.role || 'anonymous',
        academyId: /** @type {CustomUser} */ (req.user)?.academyId || req.body?.academyId || null,
        action,
        targetType,
        targetId: req.params.id || '',
        ip: req.ip,
        metadata: { method: req.method, path: req.originalUrl },
      }).catch(() => {});
    }
  });
  next();
};

export {
  authenticateUser,
  requireRole,
  requireSuperAdmin,
  requireAcademyAdmin,
  requireCoach,
  requireEmployee,
  requirePermission,
  requireAnyPermission,
  requireAcademyAccess,
  requireAcademyScope,
  requireAssignedStudent,
  requireAssignedBatch,
  audit,
};
