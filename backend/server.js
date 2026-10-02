const path = require('path');
// Preflight: show a clear error if dependencies are missing
const REQUIRED_PACKAGES = [
  'dotenv',
  'express',
  'cors',
  'mongoose',
  'multer',
  'axios',
  'twilio',
];

const missingPackages = REQUIRED_PACKAGES.filter((pkg) => {
  try {
    require.resolve(pkg);
    return false;
  } catch {
    return true;
  }
});

if (missingPackages.length) {
  console.error('Missing npm packages:', missingPackages.join(', '));
  console.error('Run npm ci from the backend directory before starting the server.');
  process.exit(1);
}

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

if (process.env.VERCEL === '1' && !process.env.MONGODB_URI) {
  mongoose.set('bufferCommands', false);
}

const app = express();
const PORT = process.env.PORT || 5000;
const uploadsDir = require('./uploadsDir');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const claimsRouter = require('./routes/claims');
app.use('/api/claims', claimsRouter);

app.get('/', (req, res) => {
  res.json({
    name: 'CropSure AI API',
    status: 'ok',
    health: '/api/health',
    claims: '/api/claims',
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get(['/favicon.ico', '/favicon.png'], (req, res) => res.status(204).end());

app.get('/uploads/:filename', (req, res, next) => {
  const filePath = path.join(uploadsDir, path.basename(req.params.filename));
  res.sendFile(filePath, (err) => {
    if (err) next(err);
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CropSure AI Server Running',
    timestamp: new Date(),
    mockMode: process.env.USE_MOCK_AI === 'true'
  });
});

// MongoDB connection (falls back to in-memory if unavailable)
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI ||
    (process.env.VERCEL === '1' ? null : 'mongodb://localhost:27017/agriclaim');

  if (!mongoUri) {
    console.warn('⚠️  MONGODB_URI is not set – using in-memory claim storage');
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.warn('⚠️  MongoDB not available – using in-memory store:', err.message);
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`
🌾 ==========================================
   CropSure AI Server Started
==========================================
🚀 Server:     http://localhost:${PORT}
📡 API Base:   http://localhost:${PORT}/api/claims
🏥 Health:     http://localhost:${PORT}/api/health
🤖 AI Mode:    ${process.env.USE_MOCK_AI === 'true' ? 'Mock (Demo Mode)' : 'Live API'}
==========================================
🖥️  Farmer Portal  → open frontend/farmer/index.html
🏢  Admin Dashboard → open frontend/admin/index.html
==========================================
`);
});

module.exports = app;
