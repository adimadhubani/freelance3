const { Client, Site, MonthlyUpdate, Panorama, Video, Image, FinalProduct } = require('../models');

/**
 * Get Client Profile details with statistics
 */
const getClientProfile = async (req, res) => {
  try {
    const clientId = req.user.client_id;

    if (!clientId) {
      return res.status(400).json({ error: 'No client profile associated with this user.' });
    }

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    // Get site counts
    const activeSitesCount = await Site.count({
      where: { client_id: clientId, status: 'Active' },
    });

    const completedSitesCount = await Site.count({
      where: { client_id: clientId, status: 'Completed' },
    });

    const totalSitesCount = await Site.count({
      where: { client_id: clientId },
    });

    // Find latest update date
    const latestSite = await Site.findOne({
      where: { client_id: clientId },
      include: [
        {
          model: MonthlyUpdate,
          as: 'monthlyUpdates',
          limit: 1,
          order: [['year', 'DESC'], ['month', 'DESC']],
        },
      ],
    });

    const latestUpdate = latestSite && latestSite.monthlyUpdates && latestSite.monthlyUpdates.length > 0
      ? `${latestSite.monthlyUpdates[0].month}/${latestSite.monthlyUpdates[0].year}`
      : 'No updates yet';

    res.json({
      client: {
        client_id: client.client_id,
        client_name: client.client_name,
        company_logo: client.company_logo,
        status: client.status,
        stats: {
          active_sites: activeSitesCount,
          completed_sites: completedSitesCount,
          total_sites: totalSitesCount,
          latest_update: latestUpdate,
        },
      },
    });
  } catch (error) {
    console.error('Get client profile error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Get all sites for the authenticated client
 */
const getClientSites = async (req, res) => {
  try {
    const clientId = req.user.client_id;

    if (!clientId) {
      return res.status(400).json({ error: 'No client profile associated with this user.' });
    }

    const sites = await Site.findAll({
      where: { client_id: clientId },
      order: [['site_name', 'ASC']],
    });

    res.json({ sites });
  } catch (error) {
    console.error('Get client sites error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Get dashboard content for a specific site (including monthly updates, videos, images, panoramas, and final products)
 */
const getSiteDashboard = async (req, res) => {
  const { siteId } = req.params;

  try {
    const queryOptions = {
      where: { site_id: siteId },
    };

    // Client users can only access their own sites
    if (req.user.role !== 'admin') {
      queryOptions.where.client_id = req.user.client_id;
    }

    const site = await Site.findOne(queryOptions);

    if (!site) {
      return res.status(404).json({ error: 'Site not found or access denied.' });
    }

    // Retrieve Monthly Updates with nested media (including file_type, original_name, is_360, video_source)
    const monthlyUpdates = await MonthlyUpdate.findAll({
      where: { site_id: siteId },
      include: [
        { model: Panorama, as: 'panoramas' },
        { model: Video, as: 'videos' },
        { model: Image, as: 'images' },
      ],
      order: [
        ['year', 'DESC'],
        ['month', 'DESC'],
      ],
    });

    // Retrieve Final Products for the site
    const finalProducts = await FinalProduct.findAll({
      where: { site_id: siteId },
      order: [['created_at', 'DESC']],
    });

    res.json({
      site,
      monthlyUpdates,
      finalProducts,
    });
  } catch (error) {
    console.error('Get site dashboard error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  getClientProfile,
  getClientSites,
  getSiteDashboard,
};
