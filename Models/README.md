# SmartBite AI/ML Service 🤖

Python Flask service providing AI-powered meal generation, nutrition analysis, health risk assessment, and conversational AI for SmartBite. Uses Groq (Llama 3.1-8b-instant) for language tasks and XGBoost + PuLP for ML optimization.

---

## 📁 Directory Structure

```
Models/
├── Procfile                              # Render deployment command
├── requirements.txt                      # Python dependencies
├── .env.example                          # Environment variable template
│
├── app/
│   ├── __init__.py
│   ├── main.py                           # Flask app factory + blueprint registration
│   │
│   ├── api/
│   │   ├── routes.py                     # Main API Blueprint (prefix: /)
│   │   │   # Endpoints:
│   │   │   #  GET  /health
│   │   │   #  POST /analyze-meals
│   │   │   #  POST /generate-weekly-plan
│   │   │   #  POST /health-risk-report
│   │   │   #  POST /chat/generateResponse
│   │   │   #  GET  /history/<userId>
│   │   │   #  GET  /weekly-plans/<userId>
│   │   │   #  GET  /health-risk-reports/<userId>
│   │   │   #  POST /summarize-weekly-meal
│   │   │   #  POST /nutrition-impact-summary
│   │   │
│   │   ├── admin.py                      # Admin Blueprint (prefix: /api/admin)
│   │   │   # HMAC-authenticated internal endpoints:
│   │   │   #  GET    /api/admin/ai-history
│   │   │   #  GET    /api/admin/health-reports
│   │   │   #  GET    /api/admin/meal-analysis
│   │   │   #  GET    /api/admin/weekly-plans
│   │   │   #  GET    /api/admin/chat-history
│   │   │   #  GET    /api/admin/user-context
│   │   │   #  GET    /api/admin/dashboard-stats
│   │   │   #  DELETE /api/admin/delete-record
│   │   │   #  POST   /api/admin/export-data
│   │   │
│   │   ├── analytics.py                  # Analytics Blueprint (prefix: /analytics)
│   │   │   # GET /analytics/overview
│   │   │   # GET /analytics/user/<userId>
│   │   │
│   │   └── internal.py                   # Internal Blueprint (prefix: /internal)
│   │       # POST /internal/sync-user-context
│   │
│   ├── services/                         # Business logic (17 services)
│   │   ├── groq_service.py               # Groq API wrapper (chat completion)
│   │   ├── nutrition_engine.py           # Meal nutrition scoring & analysis
│   │   ├── risk_analyzer.py              # Health risk scoring algorithm
│   │   ├── ai_meal_generator.py          # LLM-based single-day meal generation
│   │   ├── batch_meal_generator.py       # Batch 7-day meal generation (single Groq call)
│   │   ├── ml_model.py                   # XGBoost: predict calorie distribution
│   │   ├── weekly_optimizer.py           # PuLP: optimize daily calorie targets
│   │   ├── history_service.py            # AI history: save & fetch from MongoDB
│   │   ├── user_context_service.py       # Upsert user context in MongoDB
│   │   ├── user_context_resolver.py      # Resolve user context by userId
│   │   ├── normalize.py                  # Normalize request payloads
│   │   ├── weekly_summary_service.py     # Generate weekly plan text summary
│   │   └── nutrition_impact_service.py   # Generate nutrition impact analysis
│   │
│   ├── models/
│   │   └── schemas.py                    # Pydantic: MealPayload and related schemas
│   │
│   ├── constants/
│   │   ├── prompts.py                    # CHAT_SYSTEM_PROMPT for AI chat
│   │   └── chat_prompts.py               # DOMAIN_GUARD_PROMPT, LANGUAGE_PROMPTS
│   │
│   ├── db/
│   │   └── mongo.py                      # PyMongo connection + collection refs
│   │
│   └── utils/
│       ├── response.py                   # success() response helper
│       ├── logger.py                     # Logging configuration
│       ├── user_context.py               # normalize_user_context()
│       └── user_helpers.py               # extract_username()
│
├── datasets/                             # Training/reference datasets
├── ml/                                   # ML training pipelines
└── models/                               # Saved model artifacts (.pkl, .joblib)
```

---

## 🤖 AI Services Overview

### Groq Integration (Llama 3.1-8b-instant)
Used for all LLM tasks. Configured with domain guard prompts to only answer food/nutrition questions.
- **Chat**: `POST /chat/generateResponse` – conversational nutrition advisor (multi-language support: en-US, hi-IN, gu-IN)
- **Meal Generation**: `POST /generate-weekly-plan` – generates 7-day meal plans
- **Summaries**: `POST /summarize-weekly-meal`, `POST /nutrition-impact-summary`

### ML Model (XGBoost)
- **File**: `app/services/ml_model.py`
- **Task**: Predict calorie distribution across breakfast / lunch / dinner / snacks from user profile
- **Fallback**: Default percentages (25/30/35/10) if model fails

### Optimization (PuLP)
- **File**: `app/services/weekly_optimizer.py`
- **Task**: Linear programming to distribute weekly calorie target across 7 days
- **Fallback**: Flat daily target if optimizer fails

### Vector Search (FAISS + sentence-transformers)
- **Purpose**: Embedding-based meal similarity search for recommendations
- **Embeddings**: `sentence-transformers` generate text embeddings; `faiss-cpu` for fast similarity

### Nutrition Engine
- **File**: `app/services/nutrition_engine.py`
- **Task**: Analyze a list of meals → nutrition scores, per-meal insights, overall assessment

### Health Risk Analyzer
- **File**: `app/services/risk_analyzer.py`
- **Task**: Score dietary risks (sodium, fat, sugar, calorie excess) relative to user profile

---

## 📡 API Endpoints

### Main AI API (prefix: `/`)

| Method | Endpoint | Description | Key Fields |
|--------|----------|-------------|-----------|
| `GET` | `/health` | Health check | – |
| `POST` | `/analyze-meals` | Nutrition analysis for meals | `userId`, `meals[]` |
| `POST` | `/generate-weekly-plan` | 7-day AI meal plan | `userId`, `profile`, `targets` |
| `POST` | `/health-risk-report` | Health risk from meals | `userId`, `meals[]` |
| `POST` | `/chat/generateResponse` | AI chat response | `userId`, `message`, `language` |
| `GET` | `/history/<userId>` | AI history for user | – |
| `GET` | `/weekly-plans/<userId>` | Weekly plans history | – |
| `GET` | `/health-risk-reports/<userId>` | Health risk history | – |
| `POST` | `/summarize-weekly-meal` | Summarize weekly plan | `userId`, `weeklyPlan` |
| `POST` | `/nutrition-impact-summary` | Nutrition impact analysis | `userId`, `weeklyPlan`, `healthRiskReport` |

### Admin API (prefix: `/api/admin`) — HMAC Token Required

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ai-history` | All AI interactions |
| `GET` | `/health-reports` | All health risk reports |
| `GET` | `/meal-analysis` | All meal analyses |
| `GET` | `/weekly-plans` | All weekly plans |
| `GET` | `/chat-history` | All chat logs |
| `GET` | `/user-context` | All user context records |
| `GET` | `/dashboard-stats` | Aggregated stats |
| `DELETE` | `/delete-record` | Delete a specific AI record |
| `POST` | `/export-data` | Export as Excel/JSON |

Admin endpoints require HMAC-signed headers:
```
x-timestamp: <unix_timestamp>
x-signature: HMAC-SHA256(secret, timestamp + body)
```

### Analytics (prefix: `/analytics`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/overview` | System-wide analytics overview |
| `GET` | `/user/<userId>` | Per-user analytics |

### Internal Sync (prefix: `/internal`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/sync-user-context` | Upsert user context from Node backend |

---

## 🗃️ MongoDB Collections Used

| Collection | Purpose |
|------------|---------|
| `ai_history` | All AI interactions: chat, analysis, plans, summaries |
| `user_context` | User profile/preference data synced from Node backend |
| `health_risk_reports` | Dedicated health risk report storage |
| `meal_analysis` | Dedicated meal analysis storage |
| `weekly_plans` | Dedicated weekly plan storage |
| `users` | Referenced for username resolution in admin panel |

---

## 🚀 Setup & Running

### Prerequisites
- Python 3.8+
- MongoDB Atlas (or local) URI

### Installation

```bash
cd Models

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure env
cp .env.example .env
```

### Environment Variables (`.env`)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smartbite
PORT=5000
CORS_ORIGIN=http://localhost:5173
GROQ_API_KEY=gsk_...
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
LOG_LEVEL=INFO
NODE_BACKEND_URL=http://localhost:8000
INTERNAL_API_KEY=your-api-key
INTERNAL_HMAC_SECRET=your-hmac-secret-min-32-chars
```

### Running

```bash
# Development
python -m app.main

# OR using Flask CLI
flask --app app.main:app run --port 5000

# Production (Render)
gunicorn app.main:app --workers 2 --bind 0.0.0.0:$PORT
```

**Service runs on:** `http://localhost:5000`

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `flask` + `flask-cors` | Web framework |
| `pymongo` | MongoDB driver |
| `python-dotenv` | Environment variable loading |
| `requests` | HTTP calls to Node backend |
| `sentence-transformers` | Text embedding models |
| `faiss-cpu` | Vector similarity search |
| `xgboost` | Calorie distribution ML model |
| `pulp` | Linear programming (calorie optimizer) |
| `pandas` + `numpy` | Data processing |
| `pydantic` | Request schema validation |
| `openpyxl` + `xlsxwriter` | Excel data export |
| `gunicorn` | Production WSGI server |

---

## 🔗 Node ↔ Flask Communication

The Node.js backend and Flask AI service communicate via HTTP:

1. **Node → Flask**: `POST /generate-weekly-plan`, analysis endpoints, chat
2. **Flask → Node**: `GET /api/v1/users/internal/ai/user-context/:userId` (with `x-internal-key` header)
3. **Admin → Flask**: Node admin controller calls Flask admin endpoints with HMAC signature

User context is synced automatically when a user updates their profile (via `aiSync.service.js` on the Node side).

---

*Part of the [SmartBite](../README.md) project*