/**
 * LLM Integration Module
 * ───────────────────────
 * Priority order: Groq (free, fast) → OpenAI → Mock (demo fallback)
 * Set USE_MOCK_AI=true in .env to bypass all external calls.
 */

const axios = require('axios');

const MOCK_MODE =
  process.env.USE_MOCK_AI === 'true' ||
  (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY);

// ─── Mock responses (realistic, crop-aware) ───────────────────────────────────
function getMockResponse(cropType, severityScore) {
  const level =
    severityScore >= 75 ? 'Critical' :
    severityScore >= 55 ? 'High'     :
    severityScore >= 30 ? 'Medium'   : 'Low';

  const priorityScores = { Critical: 88, High: 72, Medium: 48, Low: 25 };

  const explanations = {
    Critical: `Severe damage detected in the ${cropType} crop field. The ${severityScore}% severity score indicates extensive destruction consistent with hailstorm, flash-flood, or large-scale pest infestation. A significant portion of the crop yield has been destroyed and immediate assessment and compensation disbursement is warranted under PMFBY guidelines.`,
    High:     `Significant damage patterns are visible in the ${cropType} field — discoloration, wilting, and structural tissue damage are evident. At ${severityScore}% severity the farmer's seasonal income is at considerable risk. Field officer verification is recommended within 7 days.`,
    Medium:   `Moderate crop stress detected in the ${cropType} field. The ${severityScore}% severity suggests partial yield loss, likely from localised disease outbreak or weather impact. Standard documentation and a verification visit should precede disbursement.`,
    Low:      `Minor stress indicators found in the ${cropType} crop. The ${severityScore}% score points to early-stage disease or limited weather damage. Normal processing timeline applies; a routine field check is advisable before finalising the claim amount.`,
  };

  const reasonings = {
    Critical: `URGENT PRIORITY: Score exceeds critical threshold (${severityScore}/100). Rapid disbursement will prevent farmer financial crisis and support timely replanting before season end.`,
    High:     `HIGH PRIORITY: Substantial loss confirmed (${severityScore}/100). Processing within 7–10 days recommended. Farmer may require interim relief support.`,
    Medium:   `MEDIUM PRIORITY: Field inspection within 15 days recommended. Standard PMFBY processing timeline applicable.`,
    Low:      `STANDARD PRIORITY: Minor damage. Normal processing queue. Field officer confirmation suggested before final approval.`,
  };

  return {
    explanation:   explanations[level],
    priorityScore: priorityScores[level] + Math.floor(Math.random() * 8 - 4),
    priorityLevel: (level === 'Critical' || level === 'High') ? 'High' : level,
    reasoning:     reasonings[level],
    model:         'mock-agriclaim-ai-v1',
  };
}

// ─── Groq API (free tier) ─────────────────────────────────────────────────────
async function callGroq(prompt) {
  const r = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: "You are an agricultural insurance assessment AI for India's PM Fasal Bima Yojana. Respond with valid JSON only — no markdown, no extra text." },
        { role: 'user',   content: prompt },
      ],
      temperature: 0.3,
      max_tokens:  600,
    },
    { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
  );
  return r.data.choices[0].message.content;
}

// ─── OpenAI API ───────────────────────────────────────────────────────────────
async function callOpenAI(prompt) {
  const r = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: "You are an agricultural insurance assessment AI for India's PM Fasal Bima Yojana. Respond with valid JSON only." },
        { role: 'user',   content: prompt },
      ],
      temperature: 0.3,
      max_tokens:  600,
    },
    { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' } }
  );
  return r.data.choices[0].message.content;
}

// ─── Main export ──────────────────────────────────────────────────────────────
async function generateClaimAssessment(cropType, severityScore, damageLevel, description, district, landArea) {
  if (MOCK_MODE) {
    console.log('🤖 Mock AI active (set GROQ_API_KEY or OPENAI_API_KEY in .env for live LLM)');
    await new Promise(r => setTimeout(r, 600));
    return getMockResponse(cropType, severityScore);
  }

  const prompt = `
Analyse this PM Fasal Bima Yojana crop damage claim and return ONLY valid JSON:

Crop: ${cropType} | District: ${district} | Area: ${landArea} acres
Severity Score: ${severityScore}/100 (${damageLevel})
Farmer Description: "${description}"

Return exactly this JSON (no markdown):
{
  "explanation":   "<2-3 sentences on likely damage cause and extent>",
  "priorityScore": <integer 0-100>,
  "priorityLevel": "<Low|Medium|High>",
  "reasoning":     "<1-2 sentences justifying the priority score>",
  "model":         "live-llm-v1"
}`.trim();

  try {
    const raw = process.env.GROQ_API_KEY ? await callGroq(prompt) : await callOpenAI(prompt);
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch (err) {
    console.error('LLM API error – falling back to mock:', err.message);
    return getMockResponse(cropType, severityScore);
  }
}

module.exports = { generateClaimAssessment };
