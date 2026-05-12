// backend/middleware/rateLimiter.js

const rateLimitStore = new Map(); // Stores { ip: { count: number, lastAttempt: timestamp } }
const MAX_LOGIN_ATTEMPTS = 5;
const COOLDOWN_PERIOD_MS = 15 * 60 * 1000; // 15 minutes

const loginRateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 0, lastAttempt: now });
  }

  const client = rateLimitStore.get(ip);

  if (client.count >= MAX_LOGIN_ATTEMPTS && (now - client.lastAttempt) < COOLDOWN_PERIOD_MS) {
    // Still in cooldown period
    return res.status(429).json({ message: 'Too many login attempts. Please try again after some time.' });
  } else if ((now - client.lastAttempt) >= COOLDOWN_PERIOD_MS) {
    // Cooldown period passed, reset
    client.count = 1;
    client.lastAttempt = now;
  } else {
    // Increment attempt count
    client.count++;
    client.lastAttempt = now;
  }
  next();
};

module.exports = loginRateLimiter;