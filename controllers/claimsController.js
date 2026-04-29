const path = require('path');
const { ClaimStore }             = require('../models/Claim');
const { analyzeCropDamage }      = require('../ai/vision');
const { generateClaimAssessment} = require('../ai/llm');

// ─── SMS helper ────────────────────────────────────────────────────────────────
async function sendSMS(phone, message) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log(`📱 [SMS MOCK] To: ${phone} | ${message}`);
    return;
  }
  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to:   phone.startsWith('+') ? phone : `+91${phone}`,
    });
  } catch (e) { console.error('SMS error:', e.message); }
}

// ─── Priority formula ──────────────────────────────────────────────────────────
// Final Priority = (0.5 × AI Score) + (0.3 × LLM Score) + (0.2 × Land Weight)
function calcFinalPriority(aiScore, llmScore, landArea) {
  const landWeight = Math.min((parseFloat(landArea) / 10) * 100, 100);
  return Math.round(0.5 * aiScore + 0.3 * llmScore + 0.2 * landWeight);
}

// ─── Background AI processing (fire-and-forget) ────────────────────────────────
async function processClaimAI(claimId, file, cropType, description, district, landArea) {
  try {
    console.log(`🤖 AI processing claim ${claimId}…`);

    const imgPath = file ? path.join(__dirname, '../uploads', file.filename) : null;
    const vision  = imgPath
      ? await analyzeCropDamage(imgPath, cropType)
      : { severityScore: Math.floor(Math.random() * 50) + 25, damageLevel: 'Medium', confidence: 80 };

    const llm = await generateClaimAssessment(
      cropType, vision.severityScore, vision.damageLevel,
      description, district, landArea
    );

    const finalPriority = calcFinalPriority(vision.severityScore, llm.priorityScore, landArea);

    await ClaimStore.updateById(claimId, {
      severityScore:    vision.severityScore,
      damageLevel:      vision.damageLevel,
      llmExplanation:   llm.explanation,
      llmPriorityScore: llm.priorityScore,
      llmReasoning:     llm.reasoning,
      finalPriority,
      status:      'Under Review',
      aiProcessed: true,
    });

    console.log(`✅ AI done for ${claimId}: severity=${vision.severityScore}%, priority=${finalPriority}/100`);
  } catch (err) {
    console.error(`❌ AI processing failed for ${claimId}:`, err.message);
  }
}

// ─── POST /api/claims ──────────────────────────────────────────────────────────
exports.submitClaim = async (req, res) => {
  try {
    const { farmerName, phone, cropType, district, landArea, description } = req.body;

    if (!farmerName || !phone || !cropType || !district || !landArea)
      return res.status(400).json({ error: 'Missing required fields: farmerName, phone, cropType, district, landArea' });

    const claim = await ClaimStore.create({
      farmerName,
      phone,
      cropType,
      district,
      landArea:    parseFloat(landArea),
      description: description || '',
      imageUrl:    req.file ? `/uploads/${req.file.filename}` : null,
      status:      'Pending',
      aiProcessed: false,
    });

    // SMS: claim received
    await sendSMS(
      phone,
      `Namaskar ${farmerName}! Your crop insurance claim ${claim.claimId} has been submitted under PM Fasal Bima Yojana. AI assessment is in progress.`
    );

    // Run AI in background – don't block the HTTP response
    processClaimAI(claim._id || claim.claimId, req.file, cropType, description || '', district, landArea)
      .catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully. AI assessment running in background.',
      claim: {
        id:         claim._id || claim.claimId,
        claimId:    claim.claimId,
        status:     claim.status,
        farmerName: claim.farmerName,
      },
    });
  } catch (err) {
    console.error('submitClaim error:', err);
    res.status(500).json({ error: 'Failed to submit claim', details: err.message });
  }
};

// ─── GET /api/claims ───────────────────────────────────────────────────────────
exports.getAllClaims = async (req, res) => {
  try {
    const claims = await ClaimStore.findAll();
    res.json({ success: true, count: claims.length, claims });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch claims', details: err.message });
  }
};

// ─── GET /api/claims/:id ───────────────────────────────────────────────────────
exports.getClaimById = async (req, res) => {
  try {
    const claim = await ClaimStore.findById(req.params.id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    res.json({ success: true, claim });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch claim', details: err.message });
  }
};

// ─── PUT /api/claims/:id/status ───────────────────────────────────────────────
exports.updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['Pending', 'Under Review', 'Approved', 'Rejected'];
    if (!valid.includes(status))
      return res.status(400).json({ error: `Invalid status. Allowed: ${valid.join(', ')}` });

    const claim = await ClaimStore.updateById(req.params.id, { status });
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    // SMS: status update
    const msgs = {
      Approved:       `Namaskar ${claim.farmerName}! Your claim ${claim.claimId} has been APPROVED ✅. Compensation will be processed within 7–10 working days under PM Fasal Bima Yojana.`,
      Rejected:       `Dear ${claim.farmerName}, your claim ${claim.claimId} has been reviewed and REJECTED. Please contact your district agriculture office for further details.`,
      'Under Review': `Dear ${claim.farmerName}, your claim ${claim.claimId} is now Under Review. A field officer may contact you for on-site verification.`,
    };
    if (msgs[status]) await sendSMS(claim.phone, msgs[status]);

    res.json({ success: true, message: `Claim status updated to ${status}`, claim });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status', details: err.message });
  }
};
