const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @param {string} role - User role
 * @returns {string} JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

/**
 * Generate refresh token
 * @param {string} id - User ID
 * @returns {string} Refresh token
 */
const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

module.exports = {
  generateToken,
  generateRefreshToken
};
