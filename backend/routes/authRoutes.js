import express from 'express';
import crypto from 'node:crypto';
import process from 'node:process';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { ROLE_HOME, ROLES } from '../constants/roles.js';
import { PERMISSIONS } from '../constants/permissions.js';
import { sign, verifyPassword, hashPassword } from '../utils/auth.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { getEffectivePermissions } from '../utils/permissions.js';
import { sendVerificationEmail } from '../services/emailService.js';
import logger from '../services/logger.js';
import observability from '../services/observabilityService.js';

const router = express.Router();

const jwtSecret = () =>
  process.env.JWT_SECRET || 'playgrid-local-dev-secret-change-me';

const PORTAL_ROLE_MAP = {
  'super-admin': ROLES.SUPER_ADMIN,
  academy: ROLES.ACADEMY_ADMIN,
  employee: ROLES.EMPLOYEE,
  student: ROLES.STUDENT,
};

const ROLE_PORTAL_MAP = {
  [ROLES.SUPER_ADMIN]: 'super-admin',
  [ROLES.ACADEMY_ADMIN]: 'academy',
  [ROLES.EMPLOYEE]: 'employee',
  [ROLES.STUDENT]: 'student',
};

const getEmailDomain = (email) => email.split('@').pop();

const normalizePhone = (phone) =>
  String(phone || '').replace(/\s+/g, '').trim();

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const sanitizeUser = (user) => {
  const effectivePermissions =
    user.effectivePermissions || getEffectivePermissions(user);

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    portalType: user.portalType || ROLE_PORTAL_MAP[user.role],
    academyId: user.academyId,
    employeeType: user.employeeType,
    permissions: effectivePermissions,
    effectivePermissions,
    assignedPermissions: user.permissions || [],
    assignedStudents: user.assignedStudents || [],
    assignedBatches: user.assignedBatches || [],
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
  };
};

const buildTokenPayload = (user, effectivePermissions) => ({
  sub: user._id.toString(),
  role: user.role,
  portalType: user.portalType || ROLE_PORTAL_MAP[user.role],
  academyId: user.academyId ? user.academyId.toString() : null,
  permissions: effectivePermissions,
  exp: Math.floor(Date.now() / 1000) + 60 * 60 * 10,
});

const getRedirectTo = (user) => {
  if (user.role === ROLES.SUPER_ADMIN) return '/super-admin/dashboard';
  if (user.role === ROLES.ACADEMY_ADMIN) return '/academy/dashboard';
  if (user.role === ROLES.EMPLOYEE) return '/employee/dashboard';
  if (user.role === ROLES.STUDENT) return '/student/dashboard';

  return ROLE_HOME[user.role] || '/login';
};

const sendSignupVerification = async (user) => {
  const rawVerificationToken = user.createEmailVerificationToken();

  await user.save();

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verificationLink = `${frontendUrl}/verify-email?token=${rawVerificationToken}`;

  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verificationLink,
  });
};

router.post('/signup', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').toLowerCase().trim();
    const phone = normalizePhone(req.body.phone);
    const password = String(req.body.password || '');
    const portalType = String(req.body.portalType || '').trim();

    if (!name || !email || !phone || !password || !portalType) {
      return res.status(400).json({
        message: 'Name, email, phone, password, and portal type are required',
      });
    }

    const role = PORTAL_ROLE_MAP[portalType];

    if (!role) {
      return res.status(400).json({
        message: 'Invalid signup portal selected',
      });
    }

    if (role === ROLES.SUPER_ADMIN) {
      return res.status(403).json({
        message: 'Super Admin accounts cannot be created from public signup',
      });
    }

    const existingEmailUser = await User.findOne({ email });

    if (existingEmailUser) {
      const existingPortalType =
        existingEmailUser.portalType || ROLE_PORTAL_MAP[existingEmailUser.role];

      if (existingEmailUser.isEmailVerified) {
        return res.status(409).json({
          message: 'Account already exists. Please login.',
        });
      }

      if (existingPortalType !== portalType) {
        return res.status(403).json({
          message:
            'This email is already linked to another portal. Please use the correct login portal.',
        });
      }

      if (existingEmailUser.phone && existingEmailUser.phone !== phone) {
        return res.status(409).json({
          message:
            'This email already has a different phone number linked. Please verify your email or contact support.',
        });
      }

      await sendSignupVerification(existingEmailUser);

      await AuditLog.create({
        actorId: existingEmailUser._id,
        actorRole: existingEmailUser.role,
        academyId: existingEmailUser.academyId,
        action: 'verification_email_resent_signup',
        targetType: 'User',
        targetId: existingEmailUser._id.toString(),
        ip: req.ip,
      });

      return res.status(200).json({
        message:
          'Account already exists but email is not verified. We sent a new verification email.',
        verificationRequired: true,
        user: sanitizeUser(existingEmailUser),
      });
    }

    const existingPhoneUser = await User.findOne({ phone })
      .select('_id role portalType phone isEmailVerified')
      .lean();

    if (existingPhoneUser) {
      return res.status(409).json({
        message:
          'This phone number is already linked to another portal/account. One phone number can only use one login portal.',
      });
    }

    const user = new User({
      name,
      email,
      phone,
      passwordHash: hashPassword(password),
      role,
      portalType,
      permissions: [],
      isActive: true,
      isEmailVerified: false,
    });

    await sendSignupVerification(user);

    await AuditLog.create({
      actorId: user._id,
      actorRole: user.role,
      academyId: user.academyId,
      action: 'signup_email_verification_pending',
      targetType: 'User',
      targetId: user._id.toString(),
      ip: req.ip,
    });

    return res.status(201).json({
      message:
        'Signup successful. Verification email has been sent to your email address.',
      verificationRequired: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/verify-email', async (req, res, next) => {
  try {
    const verificationToken = String(req.query.token || '').trim();

    if (!verificationToken) {
      return res.status(400).json({
        message: 'Verification token is required',
      });
    }

    const tokenHash = hashToken(verificationToken);

    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired verification link',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpiresAt = null;

    await user.save();

    await AuditLog.create({
      actorId: user._id,
      actorRole: user.role,
      academyId: user.academyId,
      action: 'email_verified',
      targetType: 'User',
      targetId: user._id.toString(),
      ip: req.ip,
    });

    const effectivePermissions = getEffectivePermissions(user);
    const payload = buildTokenPayload(user, effectivePermissions);
    const authToken = sign(payload, jwtSecret());
    const redirectTo = getRedirectTo(user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    return res.redirect(`${frontendUrl}${redirectTo}?token=${authToken}`);
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const password = String(req.body.password || '');
    const portalType = String(req.body.portalType || '').trim();

    if (!email || !password || !portalType) {
      observability.increment('authFailures', {
        route: req.originalUrl,
        reason: 'missing_credentials',
      });

      logger.warn('auth.login_failure', {
        category: 'auth',
        reason: 'missing_credentials',
        emailDomain: email ? getEmailDomain(email) : '',
      });

      return res.status(400).json({
        message: 'Email, password, and portal type are required',
      });
    }

    const selectedRole = PORTAL_ROLE_MAP[portalType];

    if (!selectedRole) {
      return res.status(400).json({
        message: 'Invalid login portal selected',
      });
    }

    const user = await User.findOne({ email });

    if (!user || !verifyPassword(password, user.passwordHash) || !user.isActive) {
      observability.increment('authFailures', {
        route: req.originalUrl,
        reason: 'invalid_credentials',
      });

      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const userPortalType = user.portalType || ROLE_PORTAL_MAP[user.role];

    if (user.role !== selectedRole || userPortalType !== portalType) {
      observability.increment('authFailures', {
        route: req.originalUrl,
        reason: 'portal_mismatch',
      });

      return res.status(403).json({
        message: 'This account does not have access to the selected portal.',
      });
    }

    if (!user.isEmailVerified) {
      observability.increment('authFailures', {
        route: req.originalUrl,
        reason: 'email_not_verified',
      });

      return res.status(403).json({
        message: 'Please verify your email before logging in.',
      });
    }

    const effectivePermissions = getEffectivePermissions(user);
    const payload = buildTokenPayload(user, effectivePermissions);
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

    logger.info('auth.login_success', {
      category: 'auth',
      userId: String(user._id),
      userRole: user.role,
      portalType,
      academyId: user.academyId ? String(user.academyId) : undefined,
    });

    user.effectivePermissions = effectivePermissions;

    return res.json({
      token,
      user: sanitizeUser(user),
      redirectTo: getRedirectTo(user),
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/resend-verification', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'Account not found',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: 'Email is already verified',
      });
    }

    await sendSignupVerification(user);

    await AuditLog.create({
      actorId: user._id,
      actorRole: user.role,
      academyId: user.academyId,
      action: 'verification_email_resent',
      targetType: 'User',
      targetId: user._id.toString(),
      ip: req.ip,
    });

    return res.json({
      message: 'Verification email sent again.',
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', authenticateUser, (req, res) => {
  return res.json({
    user: sanitizeUser(req.user),
    redirectTo: getRedirectTo(req.user),
  });
});

router.get('/permissions', authenticateUser, (req, res) => {
  return res.json({
    permissions: Object.values(PERMISSIONS),
    effectivePermissions: req.user.effectivePermissions,
    assignedPermissions: req.user.permissions || [],
    employeeType: req.user.employeeType,
    assignedStudents: req.user.assignedStudents || [],
    assignedBatches: req.user.assignedBatches || [],
  });
});

export default router;