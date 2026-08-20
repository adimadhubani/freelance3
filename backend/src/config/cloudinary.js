const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure dynamic Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine file type and route to target folders
    // Expected parameters on req.body: client_id, site_id, year, month, type (e.g. 360, videos, images, elevations, top-view)
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

    // Determine resource type (raw, video, image)
    let resourceType = 'image';
    if (file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else if (file.mimetype.startsWith('application/pdf') || file.mimetype.startsWith('text/') || file.mimetype.includes('octet-stream')) {
      resourceType = 'raw';
    }

    return {
      folder: folderPath,
      resource_type: resourceType,
      allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mov', 'avi', 'webm', 'pdf', 'zip'],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

module.exports = {
  cloudinary,
  storage,
};
