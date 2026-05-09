const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { ROLES } = require('../constants/roles');
const { verify } = require('../utils/auth');
const { getEffectivePermissions, hasPermission, hasAnyPermission } = require('../utils/permissions');

const jwtSecret = () => process.env.JWT_SECRET || 'playgrid-local-dev-secret-change-me';

const forbidden = (res, message = 'Access Denied') => res.status(403).json({ message });

const authenticateUser = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const payload = verify(token, jwtSecret());
    const user = await User.findById(payload.sub).select('-passwordHash').lean();
    if (!user || !user.isActive) return forbidden(res, 'Access Denied');

    user.effectivePermissions = getEffectivePermissions(user);
    req.user = user;
    req.auth = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return forbidden(res);
  next();
};

const requireSuperAdmin = () => requireRole(ROLES.SUPER_ADMIN);
const requireAcademyAdmin = () => requireRole(ROLES.ACADEMY_ADMIN);
const requireCoach = () => requireRole(ROLES.COACH);
const requireEmployee = () => requireRole(ROLES.EMPLOYEE);

const requirePermission = (permission) => (req, res, next) => {
  if (!hasPermission(req.user, permission)) return forbidden(res);
  next();
};

const requireAnyPermission = (...permissions) => (req, res, next) => {
  if (!hasAnyPermission(req.user, permissions)) return forbidden(res);
  next();
};

const requireAcademyAccess = (req, res, next) => {
  if (req.user?.role === ROLES.SUPER_ADMIN) return next();
  if (!req.user?.academyId) return forbidden(res);

  const requestedAcademyId = req.params.academyId || req.query.academyId || req.body?.academyId;
  if (requestedAcademyId && String(requestedAcademyId) !== String(req.user.academyId)) {
    return forbidden(res);
  }

  req.academyId = req.user.academyId;
  next();
};
const requireAcademyScope = requireAcademyAccess;

const requireAssignedStudent = (paramName = 'studentId') => (req, res, next) => {
  if (req.user?.role !== ROLES.COACH) return next();
  const studentId = req.params[paramName] || req.body?.studentId || req.body?._id;
  if (!studentId) return next();
  if (!(req.user.assignedStudents || []).some((id) => String(id) === String(studentId))) {
    return forbidden(res);
  }
  next();
};

const requireAssignedBatch = (paramName = 'batchId') => (req, res, next) => {
  if (req.user?.role !== ROLES.COACH) return next();
  const batchId = req.params[paramName] || req.body?.batchId || req.body?._id;
  if (!batchId) return next();
  if (!(req.user.assignedBatches || []).some((id) => String(id) === String(batchId))) {
    return forbidden(res);
  }
  next();
};

const audit = (action, targetType = '') => async (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      AuditLog.create({
        actorId: req.user?._id || null,
        actorRole: req.user?.role || 'anonymous',
        academyId: req.user?.academyId || req.body?.academyId || null,
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

module.exports = {
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
