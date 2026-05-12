// backend/utils/passwordPolicy.js

const MIN_PASSWORD_LENGTH = 8;
const WEAK_PASSWORDS = ['password', '123456', 'qwerty', 'admin', '12345678', '123456789']; // Illustrative list

const validatePassword = (password) => {
  const errors = [];

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number.');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character.');
  }
  if (WEAK_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('This password is too common and easily guessable. Please choose a stronger one.');
  }

  return errors;
};

// Placeholder for password reuse prevention logic (requires database integration)
const checkPasswordReuse = async (userId, newPasswordHash) => false; // Always returns false for now

module.exports = { validatePassword, checkPasswordReuse, MIN_PASSWORD_LENGTH };