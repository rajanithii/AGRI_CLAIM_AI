const mongoose = require('mongoose');

// ─── In-memory fallback store (works without MongoDB) ────────────────────────
const inMemoryStore = [];
let inMemoryIdCounter = 1000;

// ─── Mongoose Schema ─────────────────────────────────────────────────────────
const claimSchema = new mongoose.Schema({
  claimId:          { type: String, unique: true },
  farmerName:       { type: String, required: true },
  phone:            { type: String, required: true },
  cropType:         { type: String, required: true },
  district:         { type: String, required: true },
  landArea:         { type: Number, required: true },
  description:      { type: String, default: '' },
  imageUrl:         { type: String },
  severityScore:    { type: Number, default: 0 },
  damageLevel:      { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  llmExplanation:   { type: String, default: '' },
  llmPriorityScore: { type: Number, default: 0 },
  llmReasoning:     { type: String, default: '' },
  finalPriority:    { type: Number, default: 0 },
  status:           { type: String, enum: ['Pending', 'Under Review', 'Approved', 'Rejected'], default: 'Pending' },
  aiProcessed:      { type: Boolean, default: false },
}, { timestamps: true });

// Auto-generate a human-readable claimId
claimSchema.pre('save', function (next) {
  if (!this.claimId) {
    this.claimId = 'PMFBY-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 1000);
  }
  next();
});

let ClaimModel;
try   { ClaimModel = mongoose.model('Claim', claimSchema); }
catch { ClaimModel = mongoose.model('Claim'); }

// ─── Unified data-access layer ────────────────────────────────────────────────
// Transparently falls back to in-memory when MongoDB is unavailable.
const ClaimStore = {
  async create(data) {
    try {
      const claim = new ClaimModel(data);
      return await claim.save();
    } catch {
      const c = {
        ...data,
        _id: String(++inMemoryIdCounter),
        claimId: 'PMFBY-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 1000),
        status: 'Pending',
        aiProcessed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryStore.push(c);
      return c;
    }
  },

  async findAll() {
    try { return await ClaimModel.find().sort({ finalPriority: -1, createdAt: -1 }); }
    catch { return [...inMemoryStore].sort((a, b) => (b.finalPriority || 0) - (a.finalPriority || 0)); }
  },

  async findById(id) {
    try { return (await ClaimModel.findById(id)) || (await ClaimModel.findOne({ claimId: id })); }
    catch { return inMemoryStore.find(c => c._id === id || c.claimId === id) || null; }
  },

  async updateById(id, data) {
    try {
      return (await ClaimModel.findByIdAndUpdate(id, data, { new: true })) ||
             (await ClaimModel.findOneAndUpdate({ claimId: id }, data, { new: true }));
    } catch {
      const idx = inMemoryStore.findIndex(c => c._id === id || c.claimId === id);
      if (idx !== -1) {
        inMemoryStore[idx] = { ...inMemoryStore[idx], ...data, updatedAt: new Date() };
        return inMemoryStore[idx];
      }
      return null;
    }
  },
};

module.exports = { ClaimModel, ClaimStore };
