import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from './models/User.js';
import { hashPassword } from './utils/auth.js';

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || process.env.MONGODB_URI;

const users = [
  {
    name: 'Super Admin',
    email: 'admin@outplay.com',
    phone: '9999990000',
    password: 'Admin@123',
    role: 'super_admin',
    portalType: 'super-admin',
  },

  {
    name: 'Academy Admin',
    email: 'academy@outplay.com',
    phone: '9999990001',
    password: 'Academy@123',
    role: 'academy_admin',
    portalType: 'academy',
  },

  {
    name: 'Employee User',
    email: 'employee@outplay.com',
    phone: '9999990002',
    password: 'Employee@123',
    role: 'employee',
    portalType: 'employee',
  },

  {
    name: 'Student User',
    email: 'student@outplay.com',
    phone: '9999990003',
    password: 'Student@123',
    role: 'student',
    portalType: 'student',
  },
];

async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('MongoDB connected');

    for (const userData of users) {
      await User.findOneAndUpdate(
        { email: userData.email },
        {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          passwordHash: hashPassword(userData.password),
          role: userData.role,
          portalType: userData.portalType,
          permissions: [],
          isActive: true,
        },
        {
          upsert: true,
          new: true,
        }
      );

      console.log(
        `Seeded: ${userData.role} -> ${userData.email}`
      );
    }

    console.log('\nAll portal users created successfully');

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

seedUsers();