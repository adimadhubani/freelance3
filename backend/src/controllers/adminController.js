const { Client, User, Site, MonthlyUpdate, Panorama, Video, Image, FinalProduct } = require('../models');
const bcrypt = require('bcryptjs');

// Utility helper to get file URL depending on whether Cloudinary or Local is used
const getFileUrlAndPublicId = (req, file) => {
  if (!file) return { url: null, publicId: null };

  // If local disk storage is used, translate local path to a web URL path
  const isCloudinary = file.path.startsWith('http://') || file.path.startsWith('https://');
  if (isCloudinary) {
    return {
      url: file.path,
      publicId: file.filename || null,
    };
  } else {
    // Local storage path: serve via '/uploads/{filename}'
    const url = `/uploads/${file.filename}`;
    return {
      url,
      publicId: file.filename,
    };
  }
};

/**
 * Admin: Create a new Client
 */
const createClient = async (req, res) => {
  try {
    const { client_name } = req.body;

    if (!client_name) {
      return res.status(400).json({ error: 'Client name is required.' });
    }

    let logoUrl = null;
    if (req.files && req.files.company_logo) {
      const { url } = getFileUrlAndPublicId(req, req.files.company_logo[0]);
      logoUrl = url;
    } else if (req.body.company_logo_url) {
      logoUrl = req.body.company_logo_url;
    }

    const client = await Client.create({
      client_name,
      company_logo: logoUrl,
      status: 'Active',
    });

    res.status(201).json({
      message: 'Client created successfully.',
      client,
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Admin: Create a new Site
 */
const createSite = async (req, res) => {
  try {
    const { client_id, site_name, location, status, start_date, completion_date } = req.body;

    if (!client_id || !site_name) {
      return res.status(400).json({ error: 'client_id and site_name are required.' });
    }

    // Verify client exists
    const client = await Client.findByPk(client_id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    const site = await Site.create({
      client_id,
      site_name,
      location,
      status: status || 'Active',
      start_date: start_date || null,
      completion_date: completion_date || null,
    });

    res.status(201).json({
      message: 'Site created successfully.',
      site,
    });
  } catch (error) {
    console.error('Create site error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Admin: Upload Monthly data
 */
const uploadMonthlyData = async (req, res) => {
  try {
    const {
      site_id,
      month,
      year,
      progress_percentage,
      notes,
      panorama_title,
      video_title,
      video_type,
      folder_name,
    } = req.body;

    if (!site_id || !month || !year) {
      return res.status(400).json({ error: 'site_id, month, and year are required.' });
    }

    // Check if site exists
    const site = await Site.findByPk(site_id);
    if (!site) {
      return res.status(404).json({ error: 'Site not found.' });
    }

    // Find or create the MonthlyUpdate record
    let [monthlyUpdate, created] = await MonthlyUpdate.findOrCreate({
      where: { site_id, month: parseInt(month), year: parseInt(year) },
      defaults: {
        progress_percentage: parseInt(progress_percentage) || 0,
        update_date: new Date(),
        notes: notes || '',
      },
    });

    // If update existed, update progress percentage and notes
    if (!created) {
      if (progress_percentage !== undefined) {
        monthlyUpdate.progress_percentage = parseInt(progress_percentage);
      }
      if (notes !== undefined) {
        monthlyUpdate.notes = notes;
      }
      await monthlyUpdate.save();
    }

    const updateId = monthlyUpdate.update_id;

    // 1. Handle Panorama
    let panoramaUrl = null;
    let panoramaPublicId = null;
    if (req.files && req.files.panorama_file) {
      const { url, publicId } = getFileUrlAndPublicId(req, req.files.panorama_file[0]);
      panoramaUrl = url;
      panoramaPublicId = publicId;
    } else if (req.body.tour_url) {
      panoramaUrl = req.body.tour_url;
    }

    if (panoramaUrl) {
      await Panorama.create({
        update_id: updateId,
        title: panorama_title || `Panorama ${month}/${year}`,
        tour_url: panoramaUrl,
        thumbnail_url: panoramaUrl, // For simple panoramas, we can use same url or generic thumbnail
        cloudinary_public_id: panoramaPublicId,
      });
    }

    // 2. Handle Video
    let videoUrl = null;
    let videoPublicId = null;
    if (req.files && req.files.video_file) {
      const { url, publicId } = getFileUrlAndPublicId(req, req.files.video_file[0]);
      videoUrl = url;
      videoPublicId = publicId;
    } else if (req.body.video_url) {
      videoUrl = req.body.video_url;
    }

    if (videoUrl) {
      await Video.create({
        update_id: updateId,
        title: video_title || `Video Walkthrough ${month}/${year}`,
        video_type: video_type || 'walkthrough', // walkthrough, flythrough
        video_url: videoUrl,
        thumbnail_url: null, // video thumbnail is extracted or defaults to play icon
        cloudinary_public_id: videoPublicId,
      });
    }

    // 3. Handle Images (Multiple)
    if (req.files && req.files.image_files) {
      const imagesToCreate = req.files.image_files.map((file) => {
        const { url, publicId } = getFileUrlAndPublicId(req, file);
        return {
          update_id: updateId,
          folder_name: folder_name || 'General',
          image_url: url,
          cloudinary_public_id: publicId,
        };
      });
      await Image.bulkCreate(imagesToCreate);
    } else if (req.body.image_urls) {
      // Direct URLs fallback
      const urls = req.body.image_urls.split(',').map((u) => u.trim());
      const imagesToCreate = urls.map((url) => ({
        update_id: updateId,
        folder_name: folder_name || 'General',
        image_url: url,
      }));
      await Image.bulkCreate(imagesToCreate);
    }

    res.status(200).json({
      message: 'Monthly update content uploaded successfully.',
      monthlyUpdate,
    });
  } catch (error) {
    console.error('Upload monthly data error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Admin: Upload Final Product
 */
const uploadFinalProduct = async (req, res) => {
  try {
    const { site_id, product_type, title } = req.body;

    if (!site_id || !product_type || !title) {
      return res.status(400).json({ error: 'site_id, product_type, and title are required.' });
    }

    // Check if site exists
    const site = await Site.findByPk(site_id);
    if (!site) {
      return res.status(404).json({ error: 'Site not found.' });
    }

    // Resolve file URLs
    let productUrl = null;
    let productPublicId = null;
    if (req.files && req.files.product_file) {
      const { url, publicId } = getFileUrlAndPublicId(req, req.files.product_file[0]);
      productUrl = url;
      productPublicId = publicId;
    } else if (req.body.product_url) {
      productUrl = req.body.product_url;
    }

    let previewUrl = null;
    if (req.files && req.files.preview_file) {
      const { url } = getFileUrlAndPublicId(req, req.files.preview_file[0]);
      previewUrl = url;
    } else if (req.body.preview_url) {
      previewUrl = req.body.preview_url;
    }

    if (!productUrl) {
      return res.status(400).json({ error: 'Product file or URL is required.' });
    }

    const finalProduct = await FinalProduct.create({
      site_id,
      product_type, // elevation, top-view
      title,
      preview_url: previewUrl || productUrl, // fallback preview to main file
      file_url: productUrl,
      cloudinary_public_id: productPublicId,
    });

    res.status(201).json({
      message: 'Final product uploaded successfully.',
      finalProduct,
    });
  } catch (error) {
    console.error('Upload final product error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Admin: Get list of all clients for selectors
 */
const getClientsList = async (req, res) => {
  try {
    const clients = await Client.findAll({
      order: [['client_name', 'ASC']],
    });
    res.json({ clients });
  } catch (error) {
    console.error('Get clients list error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Admin: Get list of all sites for selectors
 */
const getSitesList = async (req, res) => {
  try {
    const sites = await Site.findAll({
      include: {
        model: Client,
        as: 'client',
        attributes: ['client_name'],
      },
      order: [['site_name', 'ASC']],
    });
    res.json({ sites });
  } catch (error) {
    console.error('Get sites list error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  createClient,
  createSite,
  uploadMonthlyData,
  uploadFinalProduct,
  getClientsList,
  getSitesList,
};

