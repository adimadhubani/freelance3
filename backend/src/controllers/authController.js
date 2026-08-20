const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Client } = require('../models');

/**
 * Handle user login
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      include: {
        model: Client,
        as: 'client',
      },
    });

    if (!user || user.status !== 'Active') {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Sign JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        client_id: user.client_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return token and user info
    res.json({
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        client_id: user.client_id,
        client_name: user.client ? user.client.client_name : null,
        company_logo: user.client ? user.client.company_logo : null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Get currently authenticated user details
 */
const me = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        client_id: user.client_id,
        client_name: user.client ? user.client.client_name : null,
        company_logo: user.client ? user.client.company_logo : null,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Handle logout
 */
const logout = async (req, res) => {
  // Stateless JWT: logout is primarily handled on the client by destroying the token
  res.json({ message: 'Logout successful.' });
};

module.exports = {
  login,
  me,
  logout,
};
