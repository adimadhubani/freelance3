// IMPORTANT: dotenv MUST be loaded before any other module that reads env vars
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { sequelize, Client, User, Site, MonthlyUpdate, Panorama, Video, Image, FinalProduct } = require('../models');

const seedDatabase = async () => {
  try {
    // Authenticate database
    await sequelize.authenticate();
    console.log('Database connection authenticated for seeding.');

    // Sync database (force: true to clear tables before seeding)
    await sequelize.sync({ force: true });
    console.log('Database tables cleared and synchronized.');

    // Hash passwords
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const clientPasswordHash = await bcrypt.hash('client123', 10);

    // 1. Create Client
    const client = await Client.create({
      client_name: 'BuildCorp Holdings',
      company_logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=200&h=200&fit=crop',
      status: 'Active',
    });
    console.log('Created Client: BuildCorp Holdings');

    // 2. Create Users
    const adminUser = await User.create({
      name: 'Admin Manager',
      email: 'admin@aeroview.com',
      password_hash: adminPasswordHash,
      role: 'admin',
      status: 'Active',
    });
    console.log('Created Admin User: admin@aeroview.com');

    const clientUser = await User.create({
      client_id: client.client_id,
      name: 'John BuildCorp',
      email: 'client@aeroview.com',
      password_hash: clientPasswordHash,
      role: 'client',
      status: 'Active',
    });
    console.log('Created Client User: client@aeroview.com');

    // 3. Create Sites
    const apexTower = await Site.create({
      client_id: client.client_id,
      site_name: 'Apex Tower Plaza',
      location: '100 Skyline Blvd, Sector 4',
      status: 'Active',
      start_date: '2026-01-01',
      completion_date: '2027-06-30',
    });
    console.log('Created Site: Apex Tower Plaza');

    const metroCenter = await Site.create({
      client_id: client.client_id,
      site_name: 'Metropolitan Retail Center',
      location: '404 Commerce Way, Downtown',
      status: 'Completed',
      start_date: '2025-03-01',
      completion_date: '2026-05-15',
    });
    console.log('Created Site: Metropolitan Retail Center');

    // 4. Create Monthly Updates for Apex Tower (June and July 2026)
    const updateJune = await MonthlyUpdate.create({
      site_id: apexTower.site_id,
      month: 6,
      year: 2026,
      progress_percentage: 35,
      update_date: '2026-06-30',
      notes: 'Foundation completed. Starting steel framing and core structural assembly.',
    });

    const updateJuly = await MonthlyUpdate.create({
      site_id: apexTower.site_id,
      month: 7,
      year: 2026,
      progress_percentage: 48,
      update_date: '2026-07-31',
      notes: 'Steel framework reached level 12. Concrete slab pouring in progress on levels 1-6.',
    });

    // 5. Create Monthly Updates for Metropolitan Retail Center (Completed site)
    const metroUpdateMay = await MonthlyUpdate.create({
      site_id: metroCenter.site_id,
      month: 5,
      year: 2026,
      progress_percentage: 100,
      update_date: '2026-05-15',
      notes: 'Final inspections cleared. Building handover completed successfully.',
    });

    console.log('Created Monthly Updates');

    // 6. Create Panoramas (360 Tours)
    // June Panorama
    await Panorama.create({
      update_id: updateJune.update_id,
      title: 'June - Site Center Core 360',
      tour_url: 'https://pannellum.org/images/alma.jpg',
      thumbnail_url: 'https://pannellum.org/images/alma.jpg',
    });

    // July Panorama
    await Panorama.create({
      update_id: updateJuly.update_id,
      title: 'July - Level 8 Steel Framing 360',
      tour_url: 'https://pannellum.org/images/jure-barrage.jpg',
      thumbnail_url: 'https://pannellum.org/images/jure-barrage.jpg',
    });

    console.log('Created Panoramas');

    // 7. Create Videos (Walkthrough / Flythrough)
    await Video.create({
      update_id: updateJune.update_id,
      title: 'Apex Tower June Drone Flythrough',
      video_type: 'flythrough',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    });

    await Video.create({
      update_id: updateJuly.update_id,
      title: 'Apex Tower July Walkthrough Tour',
      video_type: 'walkthrough',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    });

    console.log('Created Videos');

    // 8. Create Images (Site Progress Gallery)
    // June Images
    await Image.bulkCreate([
      {
        update_id: updateJune.update_id,
        folder_name: 'Excavation & Foundation',
        image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800',
      },
      {
        update_id: updateJune.update_id,
        folder_name: 'Excavation & Foundation',
        image_url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?q=80&w=800',
      },
      {
        update_id: updateJune.update_id,
        folder_name: 'Concrete Pouring',
        image_url: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=800',
      },
    ]);

    // July Images
    await Image.bulkCreate([
      {
        update_id: updateJuly.update_id,
        folder_name: 'Steel Framing',
        image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800',
      },
      {
        update_id: updateJuly.update_id,
        folder_name: 'Steel Framing',
        image_url: 'https://images.unsplash.com/photo-1531834685032-c34bf0d8b939?q=80&w=800',
      },
      {
        update_id: updateJuly.update_id,
        folder_name: 'Utility Work',
        image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800',
      },
      {
        update_id: updateJuly.update_id,
        folder_name: 'Utility Work',
        image_url: 'https://images.unsplash.com/photo-1508873696983-2df519f0397e?q=80&w=800',
      },
    ]);

    console.log('Created Site Progress Images');

    // 9. Create Final Products (Elevations & Top-views)
    await FinalProduct.create({
      site_id: apexTower.site_id,
      product_type: 'elevation',
      title: 'Apex Tower Front Elevation Plan',
      preview_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800',
      file_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200',
    });

    await FinalProduct.create({
      site_id: apexTower.site_id,
      product_type: 'elevation',
      title: 'Apex Tower Side (East) Elevation',
      preview_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800',
      file_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200',
    });

    await FinalProduct.create({
      site_id: apexTower.site_id,
      product_type: 'top-view',
      title: 'Apex Tower Site Layout & Topography Map',
      preview_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800',
      file_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200',
    });

    console.log('Created Final Products');
    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
