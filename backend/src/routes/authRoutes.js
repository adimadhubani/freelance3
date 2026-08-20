const express = require('express');
const { body } = require('express-validator');
const { login, me, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Rate limiting specifically for login attempts
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
});

// POST /api/auth/login
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  login
);

// GET /api/auth/me
router.get('/me', authenticate, me);

// POST /api/auth/logout
router.post('/logout', authenticate, logout);

module.exports = router;
