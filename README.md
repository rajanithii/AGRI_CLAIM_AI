# 🌾 CropSure AI

### Smart Crop Damage Assessment & Insurance Claim Support System

CropSure AI is a hackathon project designed to simplify crop damage assessment and support faster agricultural insurance claim processing.

The system allows farmers to submit crop damage claims with basic land and crop details along with an image. The backend analyzes the submitted claim using AI-based damage assessment and generates a priority score for administrators to review.

> **Built around the PM Fasal Bima Yojana use case.**

---

## 🚀 What CropSure AI Does

```text
Farmer
  ↓
Submit Crop Damage Claim
  ↓
Upload Crop Image
  ↓
AI Damage Assessment
  ↓
LLM-based Explanation & Priority
  ↓
Final Claim Priority Score
  ↓
Admin / District Officer Dashboard
  ↓
Approve / Reject Claim
  ↓
Farmer Notification
```

### Key Features

* 🧑‍🌾 Farmer claim submission portal
* 📷 Crop damage image upload
* 🤖 AI-assisted damage assessment
* 🧠 LLM-generated explanation and reasoning
* 📊 Claim priority scoring
* 🏢 Admin / district officer dashboard
* ✅ Claim approval and rejection
* 📱 Optional SMS notification through Twilio
* 🗄️ MongoDB support with in-memory fallback
* ⚡ Mock AI mode for easy hackathon demonstrations

---

## 📁 Project Structure

```text
cropsure-ai/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   │
│   ├── routes/
│   │   └── claims.js
│   │
│   ├── controllers/
│   │   └── claimsController.js
│   │
│   ├── ai/
│   │   ├── vision.js
│   │   └── llm.js
│   │
│   ├── models/
│   │   └── Claim.js
│   │
│   └── middleware/
│       └── upload.js
│
├── frontend/
│   ├── farmer/
│   │   └── index.html
│   │
│   └── admin/
│       └── index.html
│
├── .gitignore
├── README.md
└── package-lock.json
```

> `node_modules/`, `.env`, and uploaded files are excluded from Git through `.gitignore`.

---

# ⚡ Quick Start

## 1. Clone the repository

```bash
git clone https://github.com/rajanithii/AGRI_CLAIM_AI.git
cd AGRI_CLAIM_AI
```

## 2. Install backend dependencies

```bash
cd backend
npm install
```

## 3. Configure environment variables

Create a `.env` file from the example:

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

### macOS / Linux

```bash
cp .env.example .env
```

For a basic hackathon demo, keep:

```env
USE_MOCK_AI=true
```

This allows the application to run without external AI API keys.

---

## 4. Start the backend

```bash
node server.js
```

The server runs at:

```text
http://localhost:5000
```

API base:

```text
http://localhost:5000/api/claims
```

---

## 5. Open the frontends

### 🧑‍🌾 Farmer Portal

Open:

```text
frontend/farmer/index.html
```

### 🏢 Admin Dashboard

Open:

```text
frontend/admin/index.html
```

Admin demo credentials:

```text
Username: admin
Password: admin123
```

---

# 🧪 Demo Flow

The complete demonstration can be performed in the following sequence:

1. Open the **Farmer Portal**
2. Enter farmer details
3. Select crop and district
4. Enter land area
5. Upload a crop image
6. Submit the claim
7. Backend processes the claim
8. AI assessment generates severity information
9. LLM generates an explanation and priority score
10. Claim receives a final priority score
11. Open the **Admin Dashboard**
12. Review the submitted claim
13. Inspect the crop image and AI analysis
14. Approve or reject the claim
15. Notification is generated for the farmer

---

# 🤖 AI Processing

CropSure AI uses a two-stage AI-assisted assessment flow.

```text
             Farmer Claim
                  │
                  ▼
          Crop Damage Image
                  │
                  ▼
        ┌──────────────────┐
        │   Vision Module  │
        │    vision.js     │
        └────────┬─────────┘
                 │
        Severity + Confidence
                 │
                 ▼
        ┌──────────────────┐
        │   LLM Module     │
        │      llm.js      │
        └────────┬─────────┘
                 │
       Explanation + Priority
                 │
                 ▼
        Priority Calculation
                 │
                 ▼
        Admin Review Dashboard
```

The system supports:

* Groq
* OpenAI
* Mock AI mode

The mock mode is intended for demonstrations where external API keys are unavailable.

---

# 🧮 Claim Priority Scoring

The current prototype calculates claim priority using:

```text
Final Priority
= (0.5 × AI Severity Score)
+ (0.3 × LLM Priority Score)
+ (0.2 × Land Area Weight)
```

Land area contribution:

```text
Land Area Weight
= min((acres / 10) × 100, 100)
```

This produces a normalized priority score that can be used to sort claims for administrative review.

---

# 📡 API Reference

| Method | Endpoint                 | Description               |
| ------ | ------------------------ | ------------------------- |
| POST   | `/api/claims`            | Submit a new claim        |
| GET    | `/api/claims`            | Retrieve all claims       |
| GET    | `/api/claims/:id`        | Retrieve a specific claim |
| PUT    | `/api/claims/:id/status` | Update claim status       |
| GET    | `/api/health`            | Check server health       |

---

# 🗄️ Database

CropSure AI supports two storage modes.

### MongoDB

When MongoDB is configured, claims can be persisted across server restarts.

### In-Memory Fallback

If MongoDB is unavailable, the application can use an in-memory store for demonstrations.

> In-memory data is cleared when the backend restarts.

---

# 🔑 Optional Integrations

## Groq

For LLM-powered assessment:

```env
GROQ_API_KEY=your_key_here
USE_MOCK_AI=false
```

## OpenAI

Alternatively:

```env
OPENAI_API_KEY=your_key_here
```

## Twilio

For optional SMS notifications:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number
```

Without Twilio configuration, notification events can be logged to the backend console for demonstration purposes.

---

# 🛠️ Troubleshooting

### `Cannot find module`

Make sure backend dependencies are installed:

```bash
cd backend
npm install
```

Then start the server:

```bash
node server.js
```

### Backend not responding

Check:

```text
http://localhost:5000/api/health
```

### AI API errors

For a simple demo, use:

```env
USE_MOCK_AI=true
```

This removes the dependency on external AI API keys.

---

# 🎯 Project Goal

CropSure AI explores how AI-assisted image analysis, claim prioritization, and administrative dashboards can be combined to support faster and more structured crop damage claim assessment.

The project focuses on reducing manual effort during the initial assessment and helping administrators identify claims that may require earlier attention.

---

## 🏆 Built for Hackathons

**CropSure AI**
Smart Crop Damage Assessment & Insurance Claim Support System

🌾 Agriculture · 🤖 AI · 📊 Data · 🛡️ Insurance

**GitHub:** `rajanithii/AGRI_CLAIM_AI`
