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

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'PlayGrid AI backend is running',
    database: global.dbReady ? 'connected' : 'disconnected',
  });
});

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
