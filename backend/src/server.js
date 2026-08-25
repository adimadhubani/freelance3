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
  'http://localhost:3001',
  'https://freelance3-theta.vercel.app',        // ✅ Your domain
  'https://freelance3-theta.vercel.app/login',
  'https://freelance3-theta.vercel.app/profile',
  'https://freelance3-theta.vercel.app/sites',
  'https://freelance3-theta.vercel.app/admin',
  'https://freelance3-zeta.vercel.app',
  'https://aeroview-360.vercel.app',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman) or from allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked: ${origin}`);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Handle all OPTIONS preflight requests BEFORE any other middleware
app.options('*', cors(corsOptions));

// Middlewares
app.use(cors(corsOptions));

// Basic Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
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

// ✅ LOGGING - Debug requests
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  console.log(`📍 Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/client', require('./routes/clientRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check endpoint
// ✅ Add this BEFORE /api/health
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
  });
});

// ✅ Root endpoint (for testing)
app.get('/', (req, res) => {
  res.json({
    message: 'Aeroview 360 API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      client: '/api/client',
      admin: '/api/admin',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error.',
  });
});

// Connect to Database and start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');

    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 Aeroview 360 backend is running on port ${PORT}`);
      console.log(`📍 CORS allowed origins: ${allowedOrigins.length} origins`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database or start the server:', error);
    process.exit(1);
  }
};

startServer();