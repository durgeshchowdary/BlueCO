const { ROLES } = require('../constants/roles');

const scopedFilter = (req, base = {}) => {
  if (req.user?.role === ROLES.SUPER_ADMIN) return { ...base };
  return { ...base, academyId: req.user?.academyId };
};

const scopedPayload = (req, payload = {}) => {
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
