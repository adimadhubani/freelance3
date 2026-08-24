const express = require('express');
const { createClient, createSite, uploadMonthlyData, uploadFinalProduct, getClientsList, getSitesList } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// Apply admin protection to all routes
router.use(authenticate);
router.use(authorize('admin'));

// GET /api/admin/clients-list
router.get('/clients-list', getClientsList);

// GET /api/admin/sites-list
router.get('/sites-list', getSitesList);

// POST /api/admin/clients
router.post(
  '/clients',
  upload.fields([{ name: 'company_logo', maxCount: 1 }]),
  handleMulterError,
  createClient
);

// POST /api/admin/sites
router.post('/sites', createSite);

// POST /api/admin/monthly-data
router.post(
  '/monthly-data',
  upload.fields([
    { name: 'panorama_file', maxCount: 1 },
    { name: 'video_file', maxCount: 1 },
    { name: 'video_360_file', maxCount: 1 },
    { name: 'image_files', maxCount: 20 },
  ]),
  handleMulterError,
  uploadMonthlyData
);

// POST /api/admin/final-product
router.post(
  '/final-product',
  upload.fields([
    { name: 'product_file', maxCount: 1 },
    { name: 'preview_file', maxCount: 1 },
  ]),
  handleMulterError,
  uploadFinalProduct
);

module.exports = router;
