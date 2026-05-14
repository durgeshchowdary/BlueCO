import express from 'express';
import User from '../models/User.js';
import { sign, verifyPassword, hashPassword } from '../utils/auth.js';

const router = express.Router();

const PORTAL_ROUTES = {
  super_admin: '/super-admin/dashboard',
  academy_admin: '/academy/dashboard',
  employee: '/employee/dashboard',
  student: '/student/dashboard',
};

router.post('/signup', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
    } = req.body;

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(409).json({
        message: 'Account already exists',
      });
    }

    const existingPhone = await User.findOne({ phone });

    if (existingPhone) {
      return res.status(409).json({
        message:
          'Phone number already linked to another portal',
      });
    }

    const user = await User.create({
      name,
      email,
      phone,
      role,
      isActive: true,
      passwordHash: hashPassword(password),
    });

    return res.status(201).json({
      message: 'Signup successful',
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const {
      email,
      password,
      portalType,
    } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const validPassword = verifyPassword(
      password,
      user.passwordHash
    );

    if (!validPassword) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    if (user.role !== portalType) {
      return res.status(403).json({
        message:
          'This account does not belong to selected portal',
      });
    }

    const token = sign({
      sub: user._id.toString(),
      role: user.role,
    });

    return res.json({
      token,
      redirectTo:
        PORTAL_ROUTES[user.role] || '/',
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

export default router;