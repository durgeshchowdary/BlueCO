import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import connectDB from './config/db.js';
import studentRoutes from './routes/studentRoutes.js';
import coachRoutes from './routes/coachRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import demoRequestRoutes from './routes/demoRequestRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import authRoutes from './routes/authRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import academyRoutes from './routes/academyRoutes.js';
import coachPortalRoutes from './routes/coachPortalRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import automationRoutes from './routes/automationRoutes.js';
import aiInsightRoutes from './routes/aiInsightRoutes.js';
import copilotRoutes from './routes/copilotRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import { startSchedulers } from './schedulers/index.js';
import { tracingMiddleware } from './middleware/tracingMiddleware.js';
import logger from './services/logger.js';
import { initSentry, captureException } from './services/sentry.js';

dotenv.config();

const app = express();
initSentry();

app.use(cors({
  origin(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      process.env.FRONTEND_URL,
      ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((item) => item.trim()) : []),
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin) || process.env.CORS_ORIGIN === '*') {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: false,
}));
app.use('/api/payments/webhook/razorpay', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true, limit: '8mb' }));
app.use(tracingMiddleware);
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 600),
  standardHeaders: true,
  legacyHeaders: false,
}));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'OUT-PLAY backend is running',
    database: global.dbReady ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/academy', academyRoutes);
app.use('/api/coach', coachPortalRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/student', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/ai-insights', aiInsightRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/payroll', payrollRoutes);

app.use('/api/students', studentRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/demo-requests', demoRequestRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/announcements', announcementRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  logger.error('api.exception', {
    category: status >= 500 ? 'unhandled_exception' : 'api_error',
    status,
    error: err,
    route: req.originalUrl,
    method: req.method,
  });
  captureException(err, { status, route: req.originalUrl, method: req.method });
  res.status(status).json({
    status: 'error',
    code: status,
    message: err.message || 'Internal Server Error',
    traceId: req.headers['x-trace-id'] || 'none',
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    global.dbReady = true;
  } catch (error) {
    global.dbReady = false;
    logger.error('database.connection_failed', { category: 'database', error });
  }

  app.listen(PORT, () => {
    logger.info('server.started', { category: 'lifecycle', port: PORT });
    startSchedulers();
  });
};

startServer();
