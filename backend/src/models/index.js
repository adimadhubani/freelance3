const sequelize = require('../config/database');
const Client = require('./Client');
const User = require('./User');
const Site = require('./Site');
const MonthlyUpdate = require('./MonthlyUpdate');
const Panorama = require('./Panorama');
const Video = require('./Video');
const Image = require('./Image');
const FinalProduct = require('./FinalProduct');
const AuthOtp = require('./AuthOtp');

// 1. Client & User: One Client has many Users
Client.hasMany(User, { foreignKey: 'client_id', as: 'users', onDelete: 'CASCADE' });
User.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
User.hasMany(AuthOtp, { foreignKey: 'user_id', as: 'authOtps', onDelete: 'CASCADE' });
AuthOtp.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 2. Client & Site: One Client has many Sites
Client.hasMany(Site, { foreignKey: 'client_id', as: 'sites', onDelete: 'CASCADE' });
Site.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

// 3. Site & MonthlyUpdate: One Site has many MonthlyUpdates
Site.hasMany(MonthlyUpdate, { foreignKey: 'site_id', as: 'monthlyUpdates', onDelete: 'CASCADE' });
MonthlyUpdate.belongsTo(Site, { foreignKey: 'site_id', as: 'site' });

// 4. MonthlyUpdate & Panorama: One MonthlyUpdate has many Panoramas
MonthlyUpdate.hasMany(Panorama, { foreignKey: 'update_id', as: 'panoramas', onDelete: 'CASCADE' });
Panorama.belongsTo(MonthlyUpdate, { foreignKey: 'update_id', as: 'monthlyUpdate' });

// 5. MonthlyUpdate & Video: One MonthlyUpdate has many Videos
MonthlyUpdate.hasMany(Video, { foreignKey: 'update_id', as: 'videos', onDelete: 'CASCADE' });
Video.belongsTo(MonthlyUpdate, { foreignKey: 'update_id', as: 'monthlyUpdate' });

// 6. MonthlyUpdate & Image: One MonthlyUpdate has many Images
MonthlyUpdate.hasMany(Image, { foreignKey: 'update_id', as: 'images', onDelete: 'CASCADE' });
Image.belongsTo(MonthlyUpdate, { foreignKey: 'update_id', as: 'monthlyUpdate' });

// 7. Site & FinalProduct: One Site has many FinalProducts
Site.hasMany(FinalProduct, { foreignKey: 'site_id', as: 'finalProducts', onDelete: 'CASCADE' });
FinalProduct.belongsTo(Site, { foreignKey: 'site_id', as: 'site' });

module.exports = {
  sequelize,
  Client,
  User,
  Site,
  MonthlyUpdate,
  Panorama,
  Video,
  Image,
  FinalProduct,
  AuthOtp,
};
