require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

let storage;

const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name';

if (isCloudinaryConfigured) {
  // Use Cloudinary storage configuration
  const { storage: cloudinaryStorage } = require('../config/cloudinary');
  storage = cloudinaryStorage;
} else {
  console.warn('Cloudinary not configured or using default placeholders. Falling back to local disk storage.');
  
  // Ensure uploads directory exists
  const uploadDir = path.join(__dirname, '../../public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
});

module.exports = {
  upload,
  isCloudinaryConfigured,
};
