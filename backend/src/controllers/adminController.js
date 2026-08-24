const { sequelize, Client, User, Site, MonthlyUpdate, Panorama, Video, Image, FinalProduct } = require('../models');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { uploadToCloudinary, uploadToCloudinaryBuffer } = require('../utils/cloudinaryUpload');

/**
 * Admin: Create a new Client
 */
const createClient = async (req, res) => {
  try {
    const { client_name, user_name, email, password } = req.body;

    if (
      typeof client_name !== 'string' || !client_name.trim() ||
      typeof user_name !== 'string' || !user_name.trim() ||
      typeof email !== 'string' || !email.trim() ||
      typeof password !== 'string' || !password
    ) {
      return res.status(400).json({
        error: 'Client name, user name, email, and password are required.',
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid client login email.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Client password must be at least 8 characters.' });
    }

    let logoUrl = null;
    if (req.files && req.files.company_logo) {
      const result = await uploadToCloudinaryBuffer(req.files.company_logo[0], { folder: 'aeroview/clients/logos' });
      logoUrl = result.url;
    } else if (req.body.company_logo_url) {
      logoUrl = req.body.company_logo_url;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    const { client, user } = await sequelize.transaction(async (transaction) => {
      const createdClient = await Client.create({
        client_name: client_name.trim(),
        company_logo: logoUrl,
        status: 'Active',
      }, { transaction });

      const password_hash = await bcrypt.hash(password, 12);
      const createdUser = await User.create({
        client_id: createdClient.client_id,
        name: user_name.trim(),
        email: normalizedEmail,
        password_hash,
        role: 'client',
        status: 'Active',
      }, { transaction });

      return { client: createdClient, user: createdUser };
    });

    res.status(201).json({
      message: 'Client and client login created successfully.',
      client,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        client_id: user.client_id,
      },
    });
  } catch (error) {
    console.error('Create client error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Admin: Create a new Site
 */
const createSite = async (req, res) => {
  try {
    const { client_id, site_name, location, latitude, longitude, google_maps_url, status, start_date, completion_date } = req.body;

    if (!client_id || !site_name) {
      return res.status(400).json({ error: 'client_id and site_name are required.' });
    }

    const client = await Client.findByPk(client_id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    const latVal = latitude !== undefined && latitude !== '' && latitude !== null ? parseFloat(latitude) : null;
    const lngVal = longitude !== undefined && longitude !== '' && longitude !== null ? parseFloat(longitude) : null;

    let mapsUrl = google_maps_url || null;
    if ((latVal !== null && lngVal !== null) && (!mapsUrl || !mapsUrl.trim())) {
      mapsUrl = `https://www.google.com/maps?q=${latVal},${lngVal}`;
    }

    const site = await Site.create({
      client_id,
      site_name,
      location,
      latitude: latVal,
      longitude: lngVal,
      google_maps_url: mapsUrl,
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
 * Admin: Upload Monthly data (Supports local upload & URL, 360° videos, and PDF raw uploads)
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
      video_360_title,
      folder_name,
    } = req.body;

    if (!site_id || !month || !year) {
      return res.status(400).json({ error: 'site_id, month, and year are required.' });
    }

    const site = await Site.findByPk(site_id);
    if (!site) {
      return res.status(404).json({ error: 'Site not found.' });
    }

    let [monthlyUpdate, created] = await MonthlyUpdate.findOrCreate({
      where: { site_id, month: parseInt(month), year: parseInt(year) },
      defaults: {
        progress_percentage: parseInt(progress_percentage) || 0,
        update_date: new Date(),
        notes: notes || '',
      },
    });

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
    const folderBase = `clients/${site.client_id}/sites/${site_id}/${year}/${String(month).padStart(2, '0')}`;

    // 1. Handle Panorama
    let panoramaUrl = null;
    let panoramaPublicId = null;
    if (req.files && req.files.panorama_file) {
      const result = await uploadToCloudinaryBuffer(req.files.panorama_file[0], { folder: `${folderBase}/panoramas` });
      panoramaUrl = result.url;
      panoramaPublicId = result.publicId;
    } else if (req.body.tour_url) {
      panoramaUrl = req.body.tour_url;
    }

    if (panoramaUrl) {
      await Panorama.create({
        update_id: updateId,
        title: panorama_title || `Panorama ${month}/${year}`,
        tour_url: panoramaUrl,
        thumbnail_url: panoramaUrl,
        cloudinary_public_id: panoramaPublicId,
      });
    }

    // 2. Handle Regular Video (Walkthrough / Flythrough)
    let videoUrl = null;
    let videoPublicId = null;
    let videoSource = 'uploaded';

    if (req.files && req.files.video_file) {
      const result = await uploadToCloudinaryBuffer(req.files.video_file[0], { folder: `${folderBase}/videos` });
      videoUrl = result.url;
      videoPublicId = result.publicId;
      videoSource = 'uploaded';
    } else if (req.body.video_url) {
      videoUrl = req.body.video_url;
      const lowerUrl = videoUrl.toLowerCase();
      if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        videoSource = 'youtube';
      } else if (lowerUrl.includes('vimeo.com')) {
        videoSource = 'vimeo';
      } else {
        videoSource = 'url';
      }
    }

    if (videoUrl) {
      const is360Flag = video_type === '360' || req.body.is_360 === 'true' || req.body.is_360 === true;
      await Video.create({
        update_id: updateId,
        title: video_title || `Video Walkthrough ${month}/${year}`,
        video_type: video_type || 'walkthrough',
        video_source: videoSource,
        is_360: is360Flag,
        video_url: videoUrl,
        thumbnail_url: null,
        cloudinary_public_id: videoPublicId,
      });
    }

    // 2b. Handle 360° Video
    let video360Url = null;
    let video360PublicId = null;
    let video360Source = 'uploaded';

    if (req.files && req.files.video_360_file) {
      const result = await uploadToCloudinaryBuffer(req.files.video_360_file[0], { folder: `${folderBase}/videos_360` });
      video360Url = result.url;
      video360PublicId = result.publicId;
      video360Source = 'uploaded';
    } else if (req.body.video_360_url) {
      video360Url = req.body.video_360_url;
      const lowerUrl = video360Url.toLowerCase();
      if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        video360Source = 'youtube';
      } else if (lowerUrl.includes('vimeo.com')) {
        video360Source = 'vimeo';
      } else {
        video360Source = 'url';
      }
    }

    if (video360Url) {
      await Video.create({
        update_id: updateId,
        title: video_360_title || `360° Video Tour ${month}/${year}`,
        video_type: '360',
        video_source: video360Source,
        is_360: true,
        video_url: video360Url,
        thumbnail_url: null,
        cloudinary_public_id: video360PublicId,
      });
    }

    // 3. Handle Images and PDFs (Uploading PDFs as raw resources)
    if (req.files && req.files.image_files) {
      const imagesToCreate = [];
      for (const file of req.files.image_files) {
        try {
          const cleanName = file.originalname.replace(/\s+/g, '_');
          const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
          const folder = `${folderBase}/images`;

          const result = await uploadToCloudinary(file.buffer, {
            folder: folder,
            resource_type: isPdf ? 'raw' : 'image',
            public_id: cleanName.replace(/\.[^.]+$/, ''),
          });

          imagesToCreate.push({
            image_id: uuidv4(),
            update_id: updateId,
            folder_name: folder_name || 'General',
            image_url: result.secure_url || result.url,
            cloudinary_public_id: result.public_id,
            file_type: isPdf ? 'pdf' : 'image',
            original_name: cleanName,
          });
        } catch (err) {
          console.error('Upload error:', err.message);
        }
      }
      if (imagesToCreate.length > 0) {
        await Image.bulkCreate(imagesToCreate);
      }
    } else if (req.body.image_urls) {
      const urls = req.body.image_urls.split(',').map((u) => u.trim()).filter(Boolean);
      const imagesToCreate = urls.map((url) => {
        const isPdf = url.toLowerCase().endsWith('.pdf');
        return {
          image_id: uuidv4(),
          update_id: updateId,
          folder_name: folder_name || 'General',
          image_url: url,
          file_type: isPdf ? 'pdf' : 'image',
          original_name: url.split('/').pop() || 'file',
        };
      });
      await Image.bulkCreate(imagesToCreate);
    }

    res.status(200).json({
      message: 'Monthly update content uploaded successfully.',
      monthlyUpdate,
    });
  } catch (error) {
    console.error('Upload monthly data error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
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

    const site = await Site.findByPk(site_id);
    if (!site) {
      return res.status(404).json({ error: 'Site not found.' });
    }

    let productUrl = null;
    let productPublicId = null;
    if (req.files && req.files.product_file) {
      const result = await uploadToCloudinaryBuffer(req.files.product_file[0], { folder: `aeroview/sites/${site_id}/blueprints` });
      productUrl = result.url;
      productPublicId = result.publicId;
    } else if (req.body.product_url) {
      productUrl = req.body.product_url;
    }

    let previewUrl = null;
    if (req.files && req.files.preview_file) {
      const result = await uploadToCloudinaryBuffer(req.files.preview_file[0], { folder: `aeroview/sites/${site_id}/previews` });
      previewUrl = result.url;
    } else if (req.body.preview_url) {
      previewUrl = req.body.preview_url;
    }

    if (!productUrl) {
      return res.status(400).json({ error: 'Product file or URL is required.' });
    }

    const finalProduct = await FinalProduct.create({
      site_id,
      product_type,
      title,
      preview_url: previewUrl || productUrl,
      file_url: productUrl,
      cloudinary_public_id: productPublicId,
    });

    res.status(201).json({
      message: 'Final product uploaded successfully.',
      finalProduct,
    });
  } catch (error) {
    console.error('Upload final product error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
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
