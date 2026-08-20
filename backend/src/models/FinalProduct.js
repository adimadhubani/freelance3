const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FinalProduct = sequelize.define('FinalProduct', {
  product_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  site_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  product_type: {
    type: DataTypes.STRING,
    allowNull: false, // elevation, top-view
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  preview_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  file_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  cloudinary_public_id: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'final_products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = FinalProduct;
