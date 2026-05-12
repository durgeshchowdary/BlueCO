// backend/utils/tokenSecurity.js

const jwt = require('jsonwebtoken');

// In a real app, these would be environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeyforoutplay';
const ACCESS_TOKEN_EXPIRATION = '1h'; // 1 hour
const REFRESH_TOKEN_EXPIRATION = '7d'; // 7 days
const RESET_TOKEN_EXPIRATION = '15m'; // 15 minutes for password reset

const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });
};

const generateResetToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: RESET_TOKEN_EXPIRATION });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null; // Token is invalid or expired
  }
};

const cleanupSession = (token) => {
  // For JWTs, cleanup typically means client-side deletion.
  // If using a token blacklist, this is where you'd add the token to it.
  console.log(`SESSION CLEANUP: Token ${token ? 'received' : 'not received'} for invalidation.`);
};

module.exports = { generateAccessToken, generateRefreshToken, generateResetToken, verifyToken, cleanupSession };