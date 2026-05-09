const express = require('express');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { ROLE_HOME } = require('../constants/roles');
const { PERMISSIONS } = require('../constants/permissions');
const { sign, verifyPassword } = require('../utils/auth');
const { authenticateUser } = require('../middleware/authMiddleware');
const { getEffectivePermissions } = require('../utils/permissions');

const router = express.Router();
const jwtSecret = () => process.env.JWT_SECRET || 'playgrid-local-dev-secret-change-me';

const sanitizeUser = (user) => {
  const effectivePermissions = user.effectivePermissions || getEffectivePermissions(user);

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    academyId: user.academyId,
    employeeType: user.employeeType,
    permissions: effectivePermissions,
    effectivePermissions,
    assignedPermissions: user.permissions || [],
    assignedStudents: user.assignedStudents || [],
    assignedBatches: user.assignedBatches || [],
    isActive: user.isActive,
  };
};

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const password = String(req.body.password || '');
    const user = await User.findOne({ email });

    if (!user || !verifyPassword(password, user.passwordHash) || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      sub: user._id.toString(),
      role: user.role,
      academyId: user.academyId ? user.academyId.toString() : null,
      permissions: getEffectivePermissions(user),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 10,
    };
    const token = sign(payload, jwtSecret());

    await AuditLog.create({
      actorId: user._id,
      actorRole: user.role,
      academyId: user.academyId,
      action: 'login',
      targetType: 'User',
      targetId: user._id.toString(),
      ip: req.ip,
    });

    res.json({
      token,
      user: sanitizeUser(user),
      redirectTo: ROLE_HOME[user.role] || '/login',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticateUser, (req, res) => {
  res.json({ user: sanitizeUser(req.user), redirectTo: ROLE_HOME[req.user.role] });
});

router.get('/permissions', authenticateUser, (req, res) => {
  res.json({
    permissions: Object.values(PERMISSIONS),
    effectivePermissions: req.user.effectivePermissions,
    assignedPermissions: req.user.permissions || [],
    employeeType: req.user.employeeType,
    assignedStudents: req.user.assignedStudents || [],
    assignedBatches: req.user.assignedBatches || [],
  });
});

module.exports = router;
