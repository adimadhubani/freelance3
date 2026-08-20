const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuthOtp = sequelize.define('AuthOtp', {
  otp_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  purpose: { type: DataTypes.STRING, allowNull: false }, // login or password_reset
  code_hash: { type: DataTypes.STRING, allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  consumed_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'auth_otps',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = AuthOtp;
