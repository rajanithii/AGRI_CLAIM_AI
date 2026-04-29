const express = require('express');
const router  = express.Router();
const upload  = require('../middleware/upload');
const {
  submitClaim,
  getAllClaims,
  getClaimById,
  updateClaimStatus,
} = require('../controllers/claimsController');

// POST   /api/claims            – Submit new claim (multipart/form-data + image)
router.post('/',          upload.single('image'), submitClaim);

// GET    /api/claims            – All claims sorted by finalPriority DESC
router.get('/',           getAllClaims);

// GET    /api/claims/:id        – Single claim by MongoDB _id or claimId string
router.get('/:id',        getClaimById);

// PUT    /api/claims/:id/status – Admin: Approved | Rejected | Under Review
router.put('/:id/status', updateClaimStatus);

module.exports = router;
