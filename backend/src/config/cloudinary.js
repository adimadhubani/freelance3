const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Configure Cloudinary SDK with timeout and chunk size options
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: parseInt(process.env.CLOUDINARY_TIMEOUT) || 120000,
  chunk_size: parseInt(process.env.CLOUDINARY_CHUNK_SIZE) || 6000000,
});

// Utility to clean public_id by removing all whitespace & illegal chars
const sanitizePublicId = (filename) => {
  if (!filename) return `file_${Date.now()}`;
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const cleanName = nameWithoutExt
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .trim();
  return `${Date.now()}_${cleanName || 'file'}`;
};

// Configure dynamic Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const clientId = req.body.client_id || 'unknown-client';
    const siteId = req.body.site_id || 'unknown-site';
    const year = req.body.year || new Date().getFullYear().toString();
    const month = req.body.month || (new Date().getMonth() + 1).toString();
    const uploadType = req.body.type || 'misc';

    let folderPath = `aeroview/clients/${clientId}/sites/${siteId}`;
    if (uploadType === 'elevation' || uploadType === 'top-view') {
      folderPath += `/final-products/${uploadType}s`;
    } else {
      folderPath += `/${year}/${month}/${uploadType}`;
    }

    let resourceType = 'auto';
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    if (file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else if (isPdf || file.mimetype.startsWith('text/') || file.mimetype.includes('octet-stream')) {
      resourceType = 'raw';
    } else if (file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    }

    return {
      folder: folderPath,
      resource_type: resourceType,
      public_id: sanitizePublicId(file.originalname),
      chunk_size: parseInt(process.env.CLOUDINARY_CHUNK_SIZE) || 6000000,
      timeout: parseInt(process.env.CLOUDINARY_TIMEOUT) || 120000,
    };
  },
});

/**
 * Upload raw files (like PDFs > 10MB) directly via Cloudinary uploader API
 */
const uploadRaw = async (filePathOrBuffer, options = {}) => {
  const sanitizeName = options.filename ? sanitizePublicId(options.filename) : `raw_${Date.now()}`;
  return cloudinary.uploader.upload(filePathOrBuffer, {
    resource_type: 'raw',
    public_id: sanitizeName,
    chunk_size: parseInt(process.env.CLOUDINARY_CHUNK_SIZE) || 6000000,
    timeout: parseInt(process.env.CLOUDINARY_TIMEOUT) || 120000,
    ...options,
  });
};

module.exports = {
  cloudinary,
  storage,
  sanitizePublicId,
  uploadRaw,
};
