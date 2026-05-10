const { ROLES } = require('../constants/roles');

const isLegacyRoute = (req) => {
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

  return legacyPrefixes.some((prefix) => req.originalUrl === prefix || req.originalUrl.startsWith(`${prefix}/`));
};

const scopedFilter = (req, base = {}) => {
  if (isLegacyRoute(req)) return { ...base };
  if (req.user?.role === ROLES.SUPER_ADMIN) return { ...base };
  return { ...base, academyId: req.user?.academyId };
};

const scopedPayload = (req, payload = {}) => {
  if (isLegacyRoute(req)) return payload;
  if (req.user?.role === ROLES.SUPER_ADMIN) return payload;
  return { ...payload, academyId: req.user?.academyId };
};

const coachStudentFilter = (req, base = {}) => {
  const filter = scopedFilter(req, base);
  if (req.user?.role === ROLES.COACH) {
    filter._id = { $in: req.user.assignedStudents || [] };
  }
  return filter;
};

const coachBatchFilter = (req, base = {}) => {
  const filter = scopedFilter(req, base);
  if (req.user?.role === ROLES.COACH) {
    filter._id = { $in: req.user.assignedBatches || [] };
  }
  return filter;
};

module.exports = { scopedFilter, scopedPayload, coachStudentFilter, coachBatchFilter };
