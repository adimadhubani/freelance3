const express = require('express');
const {
  // Create
  createClient,
  createSite,
  uploadMonthlyData,
  uploadFinalProduct,
  // Selectors
  getClientsList,
  getSitesList,
  // Client CRUD
  getAllClients,
  getClientById,
  updateClient,
  updateClientPassword,
  deleteClient,
  // Site CRUD
  getAllSites,
  getSiteById,
  updateSite,
  deleteSite,
  // Monthly Update CRUD
  getAllMonthlyUpdates,
  updateMonthlyUpdate,
  deleteMonthlyUpdate,
  // Final Product CRUD
  getAllFinalProducts,
  updateFinalProduct,
  deleteFinalProduct,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// Apply admin protection to all routes
router.use(authenticate);
router.use(authorize('admin'));

// ─── Selector lists (for form dropdowns) ────────────────────────────────────
// GET /api/admin/clients-list
router.get('/clients-list', getClientsList);
// GET /api/admin/sites-list
router.get('/sites-list', getSitesList);

// ─── Create routes ────────────────────────────────────────────────────────────
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

// ─── Client CRUD ─────────────────────────────────────────────────────────────
// GET /api/admin/clients
router.get('/clients', getAllClients);
// GET /api/admin/clients/:clientId
router.get('/clients/:clientId', getClientById);
// PUT /api/admin/clients/:clientId
router.put('/clients/:clientId', updateClient);
// PUT /api/admin/clients/:clientId/password
router.put('/clients/:clientId/password', updateClientPassword);
// DELETE /api/admin/clients/:clientId
router.delete('/clients/:clientId', deleteClient);

// ─── Site CRUD ───────────────────────────────────────────────────────────────
// GET /api/admin/sites
router.get('/sites', getAllSites);
// GET /api/admin/sites/:siteId
router.get('/sites/:siteId', getSiteById);
// PUT /api/admin/sites/:siteId
router.put('/sites/:siteId', updateSite);
// DELETE /api/admin/sites/:siteId
router.delete('/sites/:siteId', deleteSite);

// ─── Monthly Update CRUD ─────────────────────────────────────────────────────
// GET /api/admin/monthly-updates
router.get('/monthly-updates', getAllMonthlyUpdates);
// PUT /api/admin/monthly-updates/:updateId
router.put('/monthly-updates/:updateId', updateMonthlyUpdate);
// DELETE /api/admin/monthly-updates/:updateId
router.delete('/monthly-updates/:updateId', deleteMonthlyUpdate);

// ─── Final Product CRUD ──────────────────────────────────────────────────────
// GET /api/admin/final-products
router.get('/final-products', getAllFinalProducts);
// PUT /api/admin/final-products/:productId
router.put('/final-products/:productId', updateFinalProduct);
// DELETE /api/admin/final-products/:productId
router.delete('/final-products/:productId', deleteFinalProduct);

module.exports = router;
