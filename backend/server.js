require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const { initFirebase, getFirebaseConfig } = require('./config/firebase');
const { initSearchIndexes } = require('./config/meilisearch');

const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/businesses');
const postRoutes = require('./routes/posts');
const searchRoutes = require('./routes/search');
const categoryRoutes = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase
initFirebase();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/categories', categoryRoutes);

// Firebase config endpoint
app.get('/api/config', (req, res) => {
  res.json({ firebase: getFirebaseConfig() });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const start = async () => {
  try {
    await initSearchIndexes();
    console.log('Search indexes ready');
  } catch (error) {
    console.warn('Search setup warning:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`Sikka server running on http://localhost:${PORT}`);
  });
};

start();
