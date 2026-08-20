const jwt = require('jsonwebtoken');
const { User, Client } = require('../models');

/**
 * Middleware to authenticate requests via JWT
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and make sure they exist and are active
    const user = await User.findOne({
      where: { user_id: decoded.user_id, status: 'Active' },
      include: {
        model: Client,
        as: 'client',
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Authentication failed. Invalid session or inactive user.' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

/**
 * Middleware factory to authorize specific roles
 * @param {Array<string>} roles - Allowed roles e.g. ['admin', 'client']
 */
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. You do not have permission to perform this action.' });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
