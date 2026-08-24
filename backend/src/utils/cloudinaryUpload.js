const cloudinary = require('cloudinary').v2;
const { sanitizePublicId } = require('../config/cloudinary');

/**
 * Upload buffer to Cloudinary using stream upload with chunking and sanitized public_id.
 * PDFs use resource_type: 'raw' and format: 'pdf'.
 * 
 * @param {Buffer} buffer - File buffer from multer
 * @param {Object} options - Upload configuration options
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!buffer) {
      return reject(new Error('No file buffer provided for upload.'));
    }

    const uploadOptions = {
      folder: options.folder || 'aeroview/uploads',
      resource_type: options.resource_type || 'auto',
      public_id: options.public_id ? sanitizePublicId(options.public_id) : null,
      access_mode: 'public',
      ...(options.resource_type === 'raw' && {
        format: 'pdf',
        use_filename: true,
        unique_filename: false,
      }),
      chunk_size: parseInt(process.env.CLOUDINARY_CHUNK_SIZE) || 6000000,
      timeout: parseInt(process.env.CLOUDINARY_TIMEOUT) || 120000,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.on('error', reject);
    uploadStream.write(buffer);
    uploadStream.end();
  });
};

/**
 * Helper to upload either a buffer or object file payload (for backwards compatibility)
 */
const uploadToCloudinaryBuffer = async (fileOrBuffer, options = {}) => {
  if (fileOrBuffer && fileOrBuffer.buffer) {
    const isPdf = fileOrBuffer.mimetype === 'application/pdf' || fileOrBuffer.originalname?.toLowerCase().endsWith('.pdf');
    const cleanPublicId = fileOrBuffer.originalname ? fileOrBuffer.originalname.replace(/\s+/g, '_').replace(/\.[^.]+$/, '') : null;
    
    const result = await uploadToCloudinary(fileOrBuffer.buffer, {
      folder: options.folder || 'aeroview/uploads',
      resource_type: isPdf ? 'raw' : (fileOrBuffer.mimetype?.startsWith('video/') ? 'video' : 'image'),
      public_id: cleanPublicId,
      ...options,
    });

    return {
      url: result.secure_url || result.url,
      publicId: result.public_id,
      resourceType: result.resource_type,
    };
  } else if (Buffer.isBuffer(fileOrBuffer)) {
    const result = await uploadToCloudinary(fileOrBuffer, options);
    return {
      url: result.secure_url || result.url,
      publicId: result.public_id,
      resourceType: result.resource_type,
    };
  }
  
  return { url: null, publicId: null, resourceType: null };
};

module.exports = {
  uploadToCloudinary,
  uploadToCloudinaryBuffer,
};
