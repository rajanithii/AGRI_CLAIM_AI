/**
 * AI Vision Module – Crop Damage Detection
 * ──────────────────────────────────────────
 * Prototype: uses simulated scoring based on image file characteristics.
 * Production: replace analyzeCropDamage() with TensorFlow.js + PlantVillage
 * or any MobileNet-based crop disease model.
 */

const fs = require('fs');

// Crop-specific risk multipliers
const CROP_PROFILES = {
  wheat:     { baseRisk: 1.10 },
  rice:      { baseRisk: 1.20 },
  cotton:    { baseRisk: 1.00 },
  sugarcane: { baseRisk: 0.90 },
  maize:     { baseRisk: 1.00 },
  soybean:   { baseRisk: 0.95 },
  groundnut: { baseRisk: 1.05 },
  pulses:    { baseRisk: 1.00 },
  tomato:    { baseRisk: 1.15 },
  onion:     { baseRisk: 0.85 },
  potato:    { baseRisk: 1.10 },
};

function analyzeImageCharacteristics(imagePath) {
  try {
    const kb        = fs.statSync(imagePath).size / 1024;
    const sizeScore = Math.min((kb / 500) * 40, 40);   // larger file → more data → higher score
    const variance  = Math.random() * 40 + 10;
    const jitter    = Date.now() % 30;
    return Math.round(sizeScore + variance + jitter);
  } catch {
    return Math.floor(Math.random() * 60) + 20;
  }
}

function getDamageLevel(score) {
  if (score >= 75) return 'Critical';
  if (score >= 55) return 'High';
  if (score >= 30) return 'Medium';
  return 'Low';
}

/**
 * Main entry point.
 * @param {string} imagePath  Absolute path to uploaded image
 * @param {string} cropType   e.g. "wheat", "rice"
 * @returns {{ severityScore, damageLevel, confidence, details }}
 */
async function analyzeCropDamage(imagePath, cropType = 'wheat') {
  // Simulate model inference latency
  await new Promise(r => setTimeout(r, 800));

  const base    = analyzeImageCharacteristics(imagePath);
  const profile = CROP_PROFILES[cropType.toLowerCase()] || { baseRisk: 1.0 };
  const score   = Math.min(Math.round(base * profile.baseRisk), 100);

  return {
    severityScore: score,
    damageLevel:   getDamageLevel(score),
    confidence:    Math.floor(Math.random() * 15) + 78,   // 78–93 %
    details: {
      method:       'Simulated Vision Analysis (MobileNet-compatible)',
      cropProfile:  profile,
      baseScore:    base,
      adjustedScore:score,
      note:         'Replace with TF.js + PlantVillage model for production',
    },
  };
}

module.exports = { analyzeCropDamage, getDamageLevel };
