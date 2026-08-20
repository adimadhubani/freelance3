const nodemailer = require('nodemailer');

const getTransport = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Email delivery is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.');
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
};

const sendOtpEmail = async ({ to, name, code, purpose }) => {
  const action = purpose === 'login' ? 'sign in' : 'reset your password';
  await getTransport().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `Aeroview 360: your code to ${action}`,
    text: `Hello ${name}, your Aeroview 360 verification code is ${code}. It expires in 10 minutes. Do not share this code.`,
    html: `<div style="font-family:Arial,sans-serif;color:#102142"><h2>Aeroview 360</h2><p>Hello ${name},</p><p>Use this verification code to ${action}:</p><p style="font-size:28px;font-weight:bold;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes. Do not share it with anyone.</p></div>`,
  });
};

module.exports = { sendOtpEmail };
