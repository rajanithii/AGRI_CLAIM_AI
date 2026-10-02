const fs = require('fs');
const path = require('path');

const uploadsDir = process.env.VERCEL === '1'
  ? path.resolve('/tmp', 'cropsure-ai-uploads')
  : path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

module.exports = uploadsDir;