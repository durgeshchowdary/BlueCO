import express from 'express';
import User from '../models/User.js';
import { sign, verifyPassword, hashPassword } from '../utils/auth.js';

const router = express.Router();

const PORTAL_ROLE_MAP = {
  'super-admin': 'super_admin',
  academy: 'academy_admin',
  employee: 'employee',
  student: 'student',
};

const ROLE_HOME = {
  super_admin: '/super-admin/dashboard',
  academy_admin: '/academy/dashboard',
  employee: '/employee/dashboard',
  student: '/student/dashboard',
};

const normalizePhone = (phone) =>
  String(phone || '').replace(/\s+/g, '').trim();

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  academyId: user.academyId || null,
  permissions: user.permissions || [],
  isActive: user.isActive,
});

router.post('/signup', async (req, res) => {
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
        message: 'Invalid portal selected',
      });
    }

    if (role === 'super_admin') {
      return res.status(403).json({
        message: 'Super Admin signup is disabled',
      });
    }

    const existingEmail = await User.findOne({ email }).lean();

    if (existingEmail) {
      return res.status(409).json({
        message: 'Account already exists. Please login.',
      });
    }

    const existingPhone = await User.findOne({ phone }).lean();

    if (existingPhone) {
      return res.status(409).json({
        message:
          'This phone number is already linked to another portal/account.',
      });
    }

    const user = await User.create({
  name,
  email,
  phone,
  passwordHash: hashPassword(password),
  role,
  portalType,
  permissions: [],
  isActive: true,
});

    return res.status(201).json({
      message: 'Signup successful. Please login.',
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Signup failed',
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const password = String(req.body.password || '');
    const portalType = String(req.body.portalType || '').trim();

    if (!email || !password || !portalType) {
      return res.status(400).json({
        message: 'Email, password, and portal type are required',
      });
    }

    const selectedRole = PORTAL_ROLE_MAP[portalType];

    if (!selectedRole) {
      return res.status(400).json({
        message: 'Invalid portal selected',
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    if (user.role !== selectedRole) {
      return res.status(403).json({
        message: 'This account does not have access to the selected portal.',
      });
    }

    const token = sign({
      sub: user._id.toString(),
      role: user.role,
      academyId: user.academyId ? user.academyId.toString() : null,
    });

    return res.json({
      token,
      user: sanitizeUser(user),
      redirectTo: ROLE_HOME[user.role] || '/login',
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Login failed',
    });
  }
});

router.get('/me', async (req, res) => {
  return res.json({
    message: 'Auth me endpoint disabled for now',
  });
});

router.get('/permissions', async (req, res) => {
  return res.json({
    permissions: [],
    effectivePermissions: [],
  });
});

export default router;