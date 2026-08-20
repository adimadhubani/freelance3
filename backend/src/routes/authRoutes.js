const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { login, me, logout, requestLoginOtp, verifyLoginOtp, requestPasswordReset, resetPassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many login attempts. Please try again after 15 minutes.' } });
const otpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { error: 'Too many code requests. Please try again after 15 minutes.' } });
const email = body('email').isEmail().withMessage('Please provide a valid email.').normalizeEmail();
const code = body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Enter the 6-digit verification code.');

router.post('/login', loginLimiter, [email, body('password').notEmpty().withMessage('Password is required.'), body('remember_me').optional().isBoolean()], validate, login);
router.post('/otp/login/request', otpLimiter, [email], validate, requestLoginOtp);
router.post('/otp/login/verify', loginLimiter, [email, code, body('remember_me').optional().isBoolean()], validate, verifyLoginOtp);
router.post('/password/forgot', otpLimiter, [email], validate, requestPasswordReset);
router.post('/password/reset', loginLimiter, [email, code, body('new_password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')], validate, resetPassword);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

module.exports = router;
