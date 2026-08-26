const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  client_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  client_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company_logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  office_location: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  office_latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  office_longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Active', // Active, Inactive
  },
}, {
  tableName: 'clients',
  timestamps: true,
  createdAt: 'created_at',
  updated_at: 'updated_at',
});

module.exports = Client;
