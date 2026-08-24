const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Video = sequelize.define('Video', {
  video_id: {
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
  video_type: {
    type: DataTypes.STRING,
    defaultValue: 'walkthrough', // walkthrough, flythrough, 360
  },
  video_source: {
    type: DataTypes.STRING, // 'uploaded', 'url', 'youtube', 'vimeo'
    allowNull: true,
    defaultValue: 'uploaded',
  },
  is_360: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  thumbnail_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  video_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  cloudinary_public_id: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'videos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Video;
