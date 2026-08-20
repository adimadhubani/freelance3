const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Image = sequelize.define('Image', {
  image_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  update_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  folder_name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'General',
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  cloudinary_public_id: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'images',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Image;
