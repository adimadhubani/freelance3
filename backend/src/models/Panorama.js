const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Panorama = sequelize.define('Panorama', {
  panorama_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  update_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  thumbnail_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tour_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  cloudinary_public_id: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'panoramas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Panorama;
