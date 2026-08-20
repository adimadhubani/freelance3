/**
 * Custom express-validator checks
 */

/**
 * Validate that value is a strong password (at least 6 chars)
 * @param {string} value 
 * @returns {boolean}
 */
const isStrongPassword = (value) => {
  if (!value || value.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  return true;
};

module.exports = {
  isStrongPassword,
};
