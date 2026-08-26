const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { AuthOtp, Client, User } = require('../models');
const { sendOtpEmail } = require('../utils/mailer');

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const publicUser = (user) => ({
  user_id: user.user_id,
  name: user.name,
  email: user.email,
  role: user.role,
  client_id: user.client_id,
  client_name: user.client ? user.client.client_name : null,
  company_logo: user.client ? user.client.company_logo : null,
  office_location: user.client ? user.client.office_location : null,
  office_latitude: user.client ? user.client.office_latitude : null,
  office_longitude: user.client ? user.client.office_longitude : null,
});

const createSession = (user, rememberMe = false) => ({
  token: jwt.sign({ user_id: user.user_id, client_id: user.client_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: rememberMe ? '30d' : '1d' }),
  user: publicUser(user),
});

const findActiveUser = (email) => User.findOne({
  where: { email: email.toLowerCase(), status: 'Active' },
  include: { model: Client, as: 'client' },
});

const issueOtp = async (user, purpose) => {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await AuthOtp.update({ consumed_at: new Date() }, { where: { user_id: user.user_id, purpose, consumed_at: null } });
  await AuthOtp.create({ user_id: user.user_id, purpose, code_hash: await bcrypt.hash(code, 12), expires_at: new Date(Date.now() + OTP_TTL_MS) });
  await sendOtpEmail({ to: user.email, name: user.name, code, purpose });
};

const consumeOtp = async (email, code, purpose) => {
  const user = await findActiveUser(email);
  if (!user) return { error: 'Invalid or expired verification code.' };
  const otp = await AuthOtp.findOne({ where: { user_id: user.user_id, purpose, consumed_at: null, expires_at: { [Op.gt]: new Date() } }, order: [['created_at', 'DESC']] });
  if (!otp || otp.attempts >= MAX_OTP_ATTEMPTS || !(await bcrypt.compare(code, otp.code_hash))) {
    if (otp) await otp.increment('attempts');
    return { error: 'Invalid or expired verification code.' };
  }
  otp.consumed_at = new Date();
  await otp.save();
  return { user };
};

const login = async (req, res) => {
  const { email, password, remember_me = false } = req.body;
  try {
    const user = await findActiveUser(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'Invalid email or password.' });
    user.last_login = new Date(); await user.save();
    return res.json(createSession(user, remember_me));
  } catch (error) { console.error('Login error:', error); return res.status(500).json({ error: 'Internal server error.' }); }
};

const requestLoginOtp = async (req, res) => {
  try {
    const user = await findActiveUser(req.body.email);
    if (user) await issueOtp(user, 'login');
    return res.json({ message: 'If an active account matches this email, a verification code has been sent.' });
  } catch (error) { console.error('Login OTP error:', error); return res.status(503).json({ error: 'Unable to send a verification code. Please try again later.' }); }
};

const verifyLoginOtp = async (req, res) => {
  try {
    const result = await consumeOtp(req.body.email, req.body.code, 'login');
    if (result.error) return res.status(401).json({ error: result.error });
    result.user.last_login = new Date(); await result.user.save();
    return res.json(createSession(result.user, req.body.remember_me));
  } catch (error) { console.error('Verify OTP error:', error); return res.status(500).json({ error: 'Internal server error.' }); }
};

const requestPasswordReset = async (req, res) => {
  try {
    const user = await findActiveUser(req.body.email);
    if (user) await issueOtp(user, 'password_reset');
    return res.json({ message: 'If an active account matches this email, a password reset code has been sent.' });
  } catch (error) { console.error('Password reset request error:', error); return res.status(503).json({ error: 'Unable to send a reset code. Please try again later.' }); }
};

const resetPassword = async (req, res) => {
  try {
    const result = await consumeOtp(req.body.email, req.body.code, 'password_reset');
    if (result.error) return res.status(400).json({ error: result.error });
    result.user.password_hash = await bcrypt.hash(req.body.new_password, 12);
    await result.user.save();
    return res.json({ message: 'Password reset successful. You can now sign in.' });
  } catch (error) { console.error('Reset password error:', error); return res.status(500).json({ error: 'Internal server error.' }); }
};

const me = async (req, res) => res.json({ user: publicUser(req.user) });
const logout = async (req, res) => res.json({ message: 'Logout successful.' });

module.exports = { login, me, logout, requestLoginOtp, verifyLoginOtp, requestPasswordReset, resetPassword };
