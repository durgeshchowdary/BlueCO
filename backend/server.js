const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');
const coachRoutes = require('./routes/coachRoutes');
const batchRoutes = require('./routes/batchRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const eventRoutes = require('./routes/eventRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const demoRequestRoutes = require('./routes/demoRequestRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const authRoutes = require('./routes/authRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const academyRoutes = require('./routes/academyRoutes');
const coachPortalRoutes = require('./routes/coachPortalRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const { authenticateUser, requireRole, requireAcademyScope } = require('./middleware/authMiddleware');
const { ROLES } = require('./constants/roles');

dotenv.config();

const app = express();

app.use(cors({
  origin(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((item) => item.trim()) : []),
    ];

    if (!origin || allowedOrigins.includes(origin) || process.env.CORS_ORIGIN === '*') {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'PlayGrid AI backend is running',
    database: global.dbReady ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

const academyOperator = [
  authenticateUser,
  requireRole(ROLES.SUPER_ADMIN, ROLES.ACADEMY_ADMIN),
  requireAcademyScope,
];

app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/academy', academyRoutes);
app.use('/api/coach', coachPortalRoutes);
app.use('/api/employee', employeeRoutes);

app.use('/api/students', academyOperator, studentRoutes);
app.use('/api/coaches', academyOperator, coachRoutes);
app.use('/api/batches', academyOperator, batchRoutes);
app.use('/api/attendance', academyOperator, attendanceRoutes);
app.use('/api/payments', academyOperator, paymentRoutes);
app.use('/api/events', academyOperator, eventRoutes);
app.use('/api/dashboard', academyOperator, dashboardRoutes);
app.use('/api/demo-requests', demoRequestRoutes);
app.use('/api/tickets', academyOperator, ticketRoutes);
app.use('/api/announcements', academyOperator, announcementRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    global.dbReady = true;
  } catch (error) {
    global.dbReady = false;
    console.error(error.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
