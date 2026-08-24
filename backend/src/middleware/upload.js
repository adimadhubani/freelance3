require('dotenv').config();
const multer = require('multer');

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name'
);

// Use memoryStorage so file buffers can be chunk-streamed to Cloudinary with sanitized public_ids
const storage = multer.memoryStorage();

// Max file size: 200MB (default) or from process.env.MAX_FILE_SIZE
const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE
  ? parseInt(process.env.MAX_FILE_SIZE)
  : 200 * 1024 * 1024; // 200MB

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, and PDFs
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mkv',
      'application/pdf', 'application/x-pdf',
    ];
    
    const isPdfExt = file.originalname?.toLowerCase().endsWith('.pdf');

    if (
      allowedMimeTypes.includes(file.mimetype) ||
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/') ||
      isPdfExt
    ) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not supported. Supported: JPG, PNG, GIF, WEBP, MP4, MOV, AVI, PDF.`));
    }
  },
});

/**
 * Express middleware to gracefully catch Multer file upload errors (e.g. file size exceeded)
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: `File size exceeds the maximum limit of ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB. Please upload a smaller file.`,
      });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message || 'File upload validation error.' });
  }
  next();
};

module.exports = {
  upload,
  isCloudinaryConfigured,
  handleMulterError,
  MAX_FILE_SIZE,
};
