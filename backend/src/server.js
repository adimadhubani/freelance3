require('dotenv').config(); // MUST be first — DB URL must be set before models load
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5001;

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman) or from allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200, // Fixes preflight 204 issues on some browsers
};

// Handle all OPTIONS preflight requests BEFORE any other middleware
app.options('*', cors(corsOptions));

// Middlewares
app.use(cors(corsOptions));

// Basic Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // increased for dev convenience
  message: { error: 'Too many requests from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Helmet — disable headers that block media streaming and iframe embeds in dev
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve locally-uploaded files (fallback when Cloudinary not configured)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));


// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/client', require('./routes/clientRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error.',
  });
});

// Connect to Database and start server
const startServer = async () => {
  try {
    // Authenticate connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync database models (alter: true automatically updates schemas safely during development)
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`Aeroview 360 backend is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start the server:', error);
    process.exit(1);
  }
};

startServer();
