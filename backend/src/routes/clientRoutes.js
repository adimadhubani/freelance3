const express = require('express');
const { getClientProfile, getClientSites, getSiteDashboard } = require('../controllers/clientController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all client routes
router.use(authenticate);
router.use(authorize(['client', 'admin']));

// GET /api/client/profile
router.get('/profile', getClientProfile);

// GET /api/client/sites
router.get('/sites', getClientSites);

// GET /api/client/sites/:siteId/dashboard
router.get('/sites/:siteId/dashboard', getSiteDashboard);

module.exports = router;
