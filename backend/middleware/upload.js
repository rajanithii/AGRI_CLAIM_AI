const multer = require('multer');
const path   = require('path');
const uploadDir = require('../uploadsDir');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `crop-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const valid   = allowed.test(path.extname(file.originalname).toLowerCase()) &&
                  allowed.test(file.mimetype);
  cb(valid ? null : new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'), valid);
};

module.exports = multer({
  storage,
  limits:     { fileSize: process.env.VERCEL === '1' ? 4 * 1024 * 1024 : 10 * 1024 * 1024 },
  fileFilter,
});
