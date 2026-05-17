# PasswordGuardian — ML-Powered Password Security Platform

**Fredrick Ighile** | [github.com/Fredrickighile](https://github.com/Fredrickighile) | [linkedin.com/in/fredrick-ighile](https://linkedin.com/in/fredrick-ighile)

**Live Demo:** [password-guardian-eight.vercel.app](https://password-guardian-eight.vercel.app)  
**API:** [passwordguardian-api.onrender.com](https://passwordguardian-api.onrender.com)  
**API Docs:** [Swagger UI](https://passwordguardian-api.onrender.com/docs)

---

## Table of Contents

1. [What This Is](#what-this-is)
2. [How It Works](#how-it-works)
3. [Tech Stack](#tech-stack)
4. [The ML Model](#the-ml-model)
5. [Breach Detection](#breach-detection)
6. [Chrome Extension](#chrome-extension)
7. [API Reference](#api-reference)
8. [Setup](#setup)
9. [Known Limitations](#known-limitations)
10. [What I Learned](#what-i-learned)

---

## What This Is

PasswordGuardian is a password security platform that combines a machine learning model with real breach data to tell you whether a password is actually safe — not just whether it meets the usual length and symbol requirements.

It's deployed across three platforms:
- A web app where you can test passwords directly
- A REST API other developers can integrate
- A Chrome extension that analyzes passwords in real time on any login page

The ML model analyzes 25 features per password and classifies it across 5 strength levels. Breach checking uses the HaveIBeenPwned database (613 million compromised credentials) with a k-anonymity protocol so your actual password never leaves your device.

---

## How It Works

```
User enters password
        │
        ▼
Frontend extracts 25 features
        │
        ├──────────────────────────────────┐
        ▼                                  ▼
FastAPI + Random Forest              SHA-1 hash → HIBP API
classifies strength (0-4)            k-anonymity breach check
        │                                  │
        └──────────────┬───────────────────┘
                       ▼
            Combined analysis returned:
            score, strength, breach count,
            crack time, improvement tips
```

---

## Tech Stack

**Frontend**

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| TypeScript | 5.6.2 | Type safety |
| Vite | 7.3.1 | Build tool |
| Tailwind CSS | 4.0.0 | Styling |
| Axios | 1.7.9 | API client |

**Backend**

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11.4 | Runtime |
| FastAPI | 0.104.1 | API framework |
| scikit-learn | 1.3.2 | ML library |
| NumPy | 1.26.2 | Numerical computing |
| Uvicorn | 0.24.0 | ASGI server |

**Infrastructure**

| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| Chrome Extensions API | Browser extension |

---

## The ML Model

**Algorithm:** Random Forest Classifier

```python
RandomForestClassifier(
    n_estimators=100,       # 100 decision trees
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1               # parallel processing
)
```

**Training data:** 10,000 passwords — 8,000 training, 2,000 test, stratified across 5 classes.

**Classes:** Very Weak (0), Weak (1), Moderate (2), Strong (3), Very Strong (4)

**Measured accuracy on test set:** 98%

### The 25 Features

The model doesn't just check length and whether you used a symbol. It analyzes 25 distinct features across 7 categories:

**Length (3 features)**
- Raw length, squared length, logarithmic length
- Non-linear scaling because the security benefit of going from 8→9 chars is different from 15→16

**Character type counts (4)**
- Uppercase count, lowercase count, digit count, special character count

**Character type ratios (4)**
- Same as above but as percentages of total length

**Entropy (1)**
- Shannon entropy — measures unpredictability based on character set diversity

**Pattern detection (5)**
- Common sequences (123, abc)
- Keyboard patterns (qwerty, asdf)
- Leet speak substitutions (p@ssw0rd)
- Repeating characters (aaa, 111)
- Dictionary word presence

**Sequential analysis (2)**
- Sequential character runs
- Repeated character groups

**Diversity metrics (3)**
- Unique character ratio
- Character type diversity score (0-4)
- Character set complexity

**Position analysis (3)**
- Starts/ends with digit
- Starts with special character

### Training Data Distribution

| Class | Samples | Strategy |
|---|---|---|
| Very Weak | 2,000 | Common passwords from breach data |
| Weak | 2,000 | Dictionary words with minor additions |
| Moderate | 2,000 | Mixed case with numbers |
| Strong | 2,000 | 12+ chars with special characters |
| Very Strong | 2,000 | 16+ chars, high entropy |

---

## Breach Detection

The breach check uses Troy Hunt's HaveIBeenPwned API with a k-anonymity protocol. The key design decision: your password hash never leaves your device.

**How it works:**

```
1. Password → SHA-1 hash
   "test123" → 7288edd0fc3ffcbe93a0cf06e3568e28521687bc

2. First 5 chars of hash sent to HIBP API
   Prefix sent: 7288e

3. API returns ~800 hash suffixes that start with 7288e

4. Local comparison checks if full hash is in that list
   Match: dd0fc3ffcbe93a0cf06e3568e28521687bc:4830

5. Breach count shown: 4,830 exposures
```

The server never sees the full hash, and HIBP never sees which specific password you're checking. This is k-anonymity — a privacy technique where individual data can't be identified within a group.

---

## Chrome Extension

The extension injects a strength indicator into password fields on any website and analyzes as you type.

**Installation:**
1. Go to `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select the `chrome-extension` folder

**Visual indicators:**

| Badge Color | Meaning |
|---|---|
| Red | Very Weak or BREACHED |
| Orange | Weak |
| Yellow | Moderate |
| Light Green | Strong |
| Green | Very Strong |

**Technical implementation:**

```javascript
// Password field detection
document.querySelectorAll('input[type="password"]');

// Debounced analysis — waits 500ms after typing stops
setTimeout(() => analyzePassword(value), 500);

// Injected indicator overlay
indicator.style.cssText = `
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10000;
`;
```

**Manifest V3** — built on the current Chrome extension standard.

### Screenshots

**Breach detected on login page**

![Breach Alert](screenshots/breach-alert.webp)

**Strong password confirmation**

![Strong Password](screenshots/strong-password.webp)

**Moderate strength warning**

![Moderate](screenshots/extension-moderate.webp)

**Very strong — 96.55% ML confidence**

![Very Strong](screenshots/extension-strong.webp)

---

## API Reference

**Base URL:** `https://passwordguardian-api.onrender.com`

> Note: First request may take 30-60 seconds due to Render cold start.

### POST `/api/passwords/analyze`

**Request:**
```json
{
  "password": "string"
}
```

**Response:**
```json
{
  "score": 72.4,
  "strength": "Strong",
  "ml_prediction": 3,
  "ml_confidence": 87.2,
  "entropy": 56.3,
  "crack_time": "12 years",
  "length": 13,
  "has_uppercase": true,
  "has_lowercase": true,
  "has_numbers": true,
  "has_special": true,
  "common_pattern_detected": false,
  "leet_speak_detected": true,
  "breach_count": 0,
  "suggestions": [
    "Avoid simple letter-to-number substitutions",
    "Consider increasing password length"
  ],
  "feature_importance": {
    "entropy": 56.3,
    "length": 13,
    "char_diversity": 4,
    "unique_ratio": 0.92,
    "pattern_detected": false
  }
}
```

**Response fields:**

| Field | Type | Description |
|---|---|---|
| `score` | float | Overall strength (0-100) |
| `strength` | string | Human-readable level |
| `ml_prediction` | int | Raw model output (0-4) |
| `ml_confidence` | float | Model confidence % |
| `entropy` | float | Shannon entropy in bits |
| `crack_time` | string | Time to crack at 1B guesses/sec |
| `breach_count` | int | Times found in breach data |
| `suggestions` | array | Specific improvement tips |

**Example integration:**
```javascript
const response = await fetch(
  "https://passwordguardian-api.onrender.com/api/passwords/analyze",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: userInput }),
  }
);

const analysis = await response.json();

if (analysis.breach_count > 0) {
  showWarning(`Password found in ${analysis.breach_count} breaches`);
} else if (analysis.score < 70) {
  showWarning("Password too weak — score: " + analysis.score);
}
```

Full interactive docs available at [Swagger UI](https://passwordguardian-api.onrender.com/docs).

---

## Setup

**Prerequisites:** Node.js 18+, Python 3.11+, Git

**1. Clone**
```bash
git clone https://github.com/Fredrickighile/password-guardian.git
cd password-guardian
```

**2. Backend**
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload
```

On first run, the model trains automatically (~3 seconds):
```
Training ML model on 10,000 passwords...
Model trained! Accuracy: 98.00%
INFO: Application startup complete.
```

Server runs at `http://localhost:8000`

**3. Frontend**
```bash
cd ../frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

**4. Chrome Extension**
```bash
# Load chrome-extension/ folder in chrome://extensions/
# Enable Developer mode → Load unpacked → select folder
```

### Project Structure

```
password-guardian/
├── backend/
│   └── app/
│       ├── main.py
│       ├── core/
│       │   └── password_analyzer.py   # ML model + feature engineering
│       └── api/
│           └── password_routes.py
├── frontend/
│   └── src/
│       ├── components/
│       │   └── PasswordAnalyzer.tsx
│       └── services/
│           └── api.ts
├── chrome-extension/
│   ├── manifest.json
│   ├── content.js
│   └── styles.css
└── screenshots/
```

---

## Known Limitations

- ML model trained on synthetic data — may not catch novel attack patterns
- Non-ASCII passwords not supported
- Chrome extension requires internet for API calls (no offline mode)
- May conflict with password manager extensions
- Render cold start on first API request (~30-60 seconds)

---

## What I Learned

The k-anonymity implementation was the most interesting part of this project. Before building this I knew HIBP existed but didn't fully understand how it could check passwords without ever seeing them. Working through the SHA-1 prefix approach made the privacy architecture click in a way that reading about it didn't.

The 25 features felt like overkill at first. I started with about 10 — length, character types, basic entropy — and the model plateaued around 89% accuracy. Adding the position analysis features (starts/ends with digit) and the non-linear length scaling pushed it past 95%. The leet speak detection was the last piece and got it to 98%.

The Chrome extension was harder than expected — not technically, but getting the indicator to render correctly on top of different sites' login forms without breaking their layouts took a lot of trial and error with z-index and positioning.

---

*Built by Fredrick Ighile*
