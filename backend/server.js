const path = require('path');
const fs = require('fs');

// Preflight: show a clear error if dependencies are missing
const REQUIRED_PACKAGES = [
  'dotenv',
  'express',
  'cors',
  'mongoose',
  'multer',
  'axios',
  'twilio',
  'openai',
  'uuid',
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
  console.error('Fix: from the project root run:');
  console.error('  cd backend');
  console.error('  npm install');
  process.exit(1);
}

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const claimsRouter = require('./routes/claims');
app.use('/api/claims', claimsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AgriClaim AI Server Running',
    timestamp: new Date(),
    mockMode: process.env.USE_MOCK_AI === 'true'
  });
});

// MongoDB connection (falls back to in-memory if unavailable)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agriclaim');
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.warn('⚠️  MongoDB not available – using in-memory store:', err.message);
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`
🌾 ==========================================
   AgriClaim AI Server Started
==========================================
🚀 Server:     http://localhost:${PORT}
📡 API Base:   http://localhost:${PORT}/api/claims
🏥 Health:     http://localhost:${PORT}/api/health
🤖 AI Mode:    ${process.env.USE_MOCK_AI === 'true' ? 'Mock (Demo Mode)' : 'Live API'}
==========================================
🖥️  Farmer Portal  → open frontend-farmer/index.html
🏢  Admin Dashboard → open frontend-admin/index.html
==========================================
`);
});

module.exports = app;
