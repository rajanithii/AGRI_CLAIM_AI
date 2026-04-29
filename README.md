# 🌾 AgriClaim AI – Setup Guide
## PM Fasal Bima Yojana · Smart Crop Damage Assessment System

---

## 📁 Folder Structure

```
agriclaim-ai/
├── backend/
│   ├── server.js                      ← Express server entry point
│   ├── package.json                   ← Dependencies
│   ├── .env.example                   ← Copy to .env and configure
│   ├── routes/
│   │   └── claims.js                  ← API route definitions
│   ├── controllers/
│   │   └── claimsController.js        ← Business logic
│   ├── ai/
│   │   ├── vision.js                  ← AI image damage detection
│   │   └── llm.js                     ← LLM assessment (Groq/OpenAI/Mock)
│   ├── models/
│   │   └── Claim.js                   ← MongoDB schema + in-memory fallback
│   ├── middleware/
│   │   └── upload.js                  ← Multer image upload handler
│   └── uploads/                       ← Auto-created on first run
├── frontend-farmer/
│   └── index.html                     ← Farmer mobile web app
└── frontend-admin/
    └── index.html                     ← Admin/District Officer dashboard
```

---

## ⚡ Quick Start (5 Minutes)

### Step 1 – Install dependencies
```bash
cd agriclaim-ai/backend
npm install
```

### Step 2 – Configure environment
```bash
cp .env.example .env
```
For hackathon demo: leave `USE_MOCK_AI=true`. No API keys needed!

### Step 3 – Start the backend
```bash
node server.js
```

Expected output:
```
🌾 ==========================================
   AgriClaim AI Server Started
==========================================
🚀 Server:     http://localhost:5000
📡 API Base:   http://localhost:5000/api/claims
🤖 AI Mode:    Mock (Demo Mode)
==========================================
```

### Step 4 – Open the frontends
| Portal | How to open |
|--------|-------------|
| 🧑‍🌾 Farmer App | Double-click `frontend-farmer/index.html` |
| 🏢 Admin Dashboard | Double-click `frontend-admin/index.html` |

Admin login: **admin / admin123**

---

## 🛠️ Troubleshooting (Module Not Found)

If you see `Error: Cannot find module ...`, it means backend dependencies are not installed in the `backend/` folder.

```bash
cd agriclaim-ai/backend
npm install
node server.js
```

If you still have issues, delete `backend/node_modules` and run `npm install` again.

---

## 🔑 Optional API Keys (make the demo more impressive)

### Groq – Free & Fast LLM ⭐ Recommended
1. Get free key at: https://console.groq.com
2. Add to `.env`: `GROQ_API_KEY=gsk_...`
3. Set: `USE_MOCK_AI=false`

### OpenAI (alternative)
1. Get key at: https://platform.openai.com
2. Add to `.env`: `OPENAI_API_KEY=sk-...`

### Twilio SMS (optional)
1. Free trial at: https://www.twilio.com
2. Add to `.env`: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
3. SMS will be delivered to real phones!

> Without Twilio keys, SMS messages are logged to the terminal — still impressive for demos.

---

## 🧪 Demo Flow (for judges)

1. **Open Farmer App** → Login with any name and phone number
2. **Fill claim form** → Select crop, district, land area
3. **Upload a crop photo** → Any image works for demo
4. **Submit claim** → Watch terminal for AI processing logs
5. **Open Admin Dashboard** → Claim appears sorted by AI priority score
6. **Click the claim** → See crop image + AI explanation + LLM reasoning
7. **Click Approve/Reject** → SMS notification sent (logged in terminal)

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/claims` | Submit new claim (multipart/form-data) |
| `GET`  | `/api/claims` | All claims sorted by finalPriority DESC |
| `GET`  | `/api/claims/:id` | Single claim by ID or claimId string |
| `PUT`  | `/api/claims/:id/status` | Admin: update status |
| `GET`  | `/api/health` | Server health check |

---

## 🧮 Priority Scoring Formula

```
Final Priority = (0.5 × AI Severity Score)
               + (0.3 × LLM Priority Score)
               + (0.2 × Land Area Weight)

Land Area Weight = min((acres / 10) × 100, 100)
```

---

## 🗄️ Database

The system works in two modes:
- **With MongoDB**: Persistent storage across restarts
- **Without MongoDB**: In-memory store (perfect for hackathon demo, data resets on restart)

---

## 🤖 AI Architecture

```
Farmer uploads image
        ↓
   vision.js (AI Damage Detection)
   ├── Analyzes image characteristics
   ├── Applies crop-specific risk profiles
   └── Returns: { severityScore, damageLevel, confidence }
        ↓
   llm.js (LLM Assessment)
   ├── Groq / OpenAI / Mock fallback
   ├── Generates damage explanation
   └── Returns: { explanation, priorityScore, reasoning }
        ↓
   Priority Formula
   └── finalPriority = 0.5×AI + 0.3×LLM + 0.2×LandWeight
        ↓
   Admin dashboard sorted by finalPriority DESC
```

---

Built for Hackathon 🏆 · AgriClaim AI · PM Fasal Bima Yojana 🇮🇳
