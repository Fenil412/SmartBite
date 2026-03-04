# SmartBite 🍽️ – AI-Powered Meal Planner & Nutrition Assistant

[![Live Demo](https://img.shields.io/badge/Live-mealgenerator.me-green)](https://mealgenerator.me)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black)](https://smart-bite-woad.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

SmartBite is a **full-stack web application** that revolutionizes meal planning through **AI-powered personalized recommendations** and **intelligent nutrition analysis**. It combines a React frontend, a Node.js/Express backend, and a Python/Flask AI service to help users achieve their health and fitness goals through smart dietary choices.

---

## 🌟 Key Features

- **AI Weekly Meal Plan Generator** – Groq LLM + ML model generates a 7-day personalized plan
- **Meal Nutrition Analysis** – Deep per-meal nutrition breakdown with health scoring
- **Health Risk Report** – Identifies dietary risks based on user profile and meals
- **AI Chat Assistant** – Conversational nutrition advisor powered by Groq (Llama 3.1)
- **Grocery List Generator** – Auto-generates shopping lists with cost estimates from meal plans
- **User Constraints & Preferences** – Store cooking skill, appliances, dietary restrictions
- **Admin Dashboard** – Full user/content management, analytics, and data export
- **Notification System** – Email & SMS notifications via Resend and Twilio
- **Analytics & Activity Tracking** – Per-user AI interaction stats, feedback stats

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)                     │
│               https://mealgenerator.me                       │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTP / REST (Axios)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API (Node.js + Express)                 │
│                   Port 8000 (Render)                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │   Auth /    │  │  Meal / Plan │  │   Admin / Analytics│  │
│  │   Users     │  │  Grocery     │  │   Notifications    │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
└───────────┬─────────────────────────────────────────────────┘
            │                              │
            ▼                              ▼
┌───────────────────┐         ┌────────────────────────────┐
│  MongoDB Atlas    │         │  Flask / Python AI Service  │
│  (Primary DB)     │         │  Port 5000 (Render)         │
│                   │         │                             │
│  Collections:     │         │  • Groq Chat (Llama 3.1)   │
│  - users          │         │  • Meal Analysis Engine     │
│  - meals          │         │  • Weekly Plan Generator    │
│  - mealplans      │         │  • Health Risk Analyzer     │
│  - constraints    │         │  • FAISS ML Recommendations │
│  - feedback       │         │  • Nutrition Impact Summary │
│  - notifications  │         │                             │
│  - aihistory      │◄────────│  MongoDB (AI history/ctx)   │
└───────────────────┘         └────────────────────────────┘
            │
            ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│  Cloudinary (Images)     │   │  Resend + Twilio (Email/  │
│                          │   │  SMS Notifications)        │
└──────────────────────────┘   └──────────────────────────┘
```

---

## 🗂️ Full Project Structure

```
SmartBite/
├── client/                         # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx                 # Root component with routing
│   │   ├── main.jsx                # React entry point
│   │   ├── index.css               # Global styles
│   │   ├── api/                    # Axios base instance
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Layout.jsx          # App shell layout
│   │   │   ├── Sidebar.jsx         # Responsive navigation
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ...                 # 35+ components total
│   │   ├── contexts/               # React context providers
│   │   │   ├── AuthContext.jsx     # Auth state management
│   │   │   ├── ThemeContext.jsx    # Dark/light theme
│   │   │   └── NotificationContext.jsx
│   │   ├── hooks/                  # Custom hooks
│   │   │   ├── useCustomCursor.js
│   │   │   └── useAuth.js
│   │   ├── pages/                  # Route-level pages
│   │   │   ├── auth/               # Login, Register
│   │   │   ├── dashboard/          # Home dashboard
│   │   │   ├── meals/              # Meal browse & create
│   │   │   ├── mealplan/           # Plan management
│   │   │   ├── ai/                 # AI chat, analysis pages
│   │   │   ├── analytics/          # Analytics dashboard
│   │   │   ├── grocery/            # Grocery list pages
│   │   │   └── admin/              # Admin panel pages
│   │   ├── services/               # API service modules (15 files)
│   │   ├── store/                  # Zustand global store
│   │   ├── styles/                 # Additional CSS
│   │   └── utils/                  # Utility helpers
│   ├── public/                     # Static assets
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── package.json
│
├── server/                         # Node.js + Express backend
│   ├── src/
│   │   ├── app.js                  # Express app setup, CORS, routes
│   │   ├── index.js                # Server entry point
│   │   ├── constants.js
│   │   ├── controllers/            # Request handlers (13 controllers)
│   │   │   ├── user.controller.js
│   │   │   ├── admin.controller.js
│   │   │   ├── meal.controller.js
│   │   │   ├── mealPlan.controller.js
│   │   │   ├── recommendation.controller.js
│   │   │   ├── grocery.controller.js
│   │   │   ├── analytics.controller.js
│   │   │   ├── notification.controller.js
│   │   │   ├── feedback.controller.js
│   │   │   ├── constraint.controller.js
│   │   │   ├── mlContract.controller.js
│   │   │   └── ...
│   │   ├── models/                 # Mongoose schemas (7 models)
│   │   │   ├── user.model.js
│   │   │   ├── meal.model.js
│   │   │   ├── mealPlan.model.js
│   │   │   ├── constraint.model.js
│   │   │   ├── feedback.model.js
│   │   │   ├── notification.model.js
│   │   │   └── aiHistory.model.js
│   │   ├── routes/                 # Route definitions (13 files)
│   │   │   ├── user.routes.js
│   │   │   ├── admin.routes.js
│   │   │   ├── meal.routes.js
│   │   │   ├── mealPlan.routes.js
│   │   │   ├── recommendation.routes.js
│   │   │   ├── grocery.routes.js
│   │   │   ├── analytics.routes.js
│   │   │   ├── notification.routes.js
│   │   │   ├── feedback.routes.js
│   │   │   ├── constraint.routes.js
│   │   │   ├── mlContract.routes.js
│   │   │   ├── email.routes.js
│   │   │   └── healthcheck.routes.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js  # JWT verification
│   │   │   ├── role.middleware.js  # adminOnly / superAdminOnly
│   │   │   ├── multer.middleware.js # File uploads
│   │   │   └── error.middleware.js
│   │   ├── services/               # Business logic & integrations
│   │   │   ├── aiSync.service.js   # Node→Flask sync
│   │   │   ├── notification.service.js
│   │   │   ├── mlContract.service.js
│   │   │   ├── grocery.service.js
│   │   │   └── cron/               # Cron jobs
│   │   │       └── weeklySummary.cron.js
│   │   ├── utils/                  # Helpers
│   │   │   ├── ApiResponse.js
│   │   │   ├── ApiError.js
│   │   │   ├── mailer.js
│   │   │   ├── cloudinary.js
│   │   │   └── ...
│   │   ├── workers/
│   │   │   └── notification.retry.js
│   │   └── db/
│   │       └── index.js             # MongoDB connection
│   ├── uploads/                    # Temp file storage
│   ├── public/                     # Static assets
│   ├── .env.sample
│   └── package.json
│
├── Models/                         # Python Flask AI/ML service
│   ├── app/
│   │   ├── main.py                 # Flask app factory
│   │   ├── api/
│   │   │   ├── routes.py           # Main AI endpoints (Blueprint: api)
│   │   │   ├── admin.py            # Admin endpoints (Blueprint: admin)
│   │   │   ├── analytics.py        # Analytics endpoints (Blueprint: analytics_bp)
│   │   │   └── internal.py         # Internal sync endpoints
│   │   ├── services/               # AI/ML business logic (17 services)
│   │   │   ├── groq_service.py     # Groq LLM integration
│   │   │   ├── nutrition_engine.py # Nutrition analysis
│   │   │   ├── risk_analyzer.py    # Health risk scoring
│   │   │   ├── ai_meal_generator.py# LLM-based meal creation
│   │   │   ├── ml_model.py         # XGBoost distribution predictor
│   │   │   ├── weekly_optimizer.py # PuLP calorie optimizer
│   │   │   ├── batch_meal_generator.py # Batch AI generation
│   │   │   ├── history_service.py  # AI history CRUD
│   │   │   ├── user_context_service.py # User context upsert
│   │   │   ├── user_context_resolver.py# Resolve user context
│   │   │   ├── normalize.py        # Payload normalization
│   │   │   ├── weekly_summary_service.py
│   │   │   └── nutrition_impact_service.py
│   │   ├── models/
│   │   │   └── schemas.py          # Pydantic schemas
│   │   ├── constants/
│   │   │   ├── prompts.py          # System prompts
│   │   │   └── chat_prompts.py     # Domain guard & language prompts
│   │   ├── db/
│   │   │   └── mongo.py            # PyMongo connection
│   │   └── utils/
│   │       ├── response.py         # Unified response helper
│   │       ├── logger.py
│   │       ├── user_context.py
│   │       └── user_helpers.py
│   ├── datasets/                   # Training/reference data
│   ├── ml/                         # ML pipelines
│   ├── models/                     # Trained model artifacts
│   ├── Procfile                    # Render deployment cmd
│   ├── requirements.txt
│   └── .env.example
│
├── .gitignore
├── LICENSE
└── README.md                       # This file
```

---

## 🗄️ ER Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           DATABASE ENTITIES                               │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐
│           USER              │
├─────────────────────────────┤
│ _id (ObjectId) PK           │
│ email (String, unique)      │
│ username (String, unique)   │
│ password (String, hashed)   │
│ name (String)               │
│ phone (String)              │
│ avatar { publicId, url }    │
│ roles [user|admin|super_admin] │
│ isVerified (Boolean)        │
│ locale (String)             │
│ timezone (String)           │
│ profile {                   │
│   age, heightCm, weightKg,  │
│   gender, activityLevel,    │
│   goal, dietaryPreferences, │
│   dietaryRestrictions,      │
│   allergies, medicalNotes   │
│ }                           │
│ preferences {               │
│   units, budgetTier,        │
│   preferredCuisines         │
│ }                           │
│ constraints {               │
│   maxCookTime, skillLevel,  │
│   appliances                │
│ }                           │
│ notificationPreferences { } │
│ favoriteMeals [Meal refs]   │
│ planHistory [Plan refs]     │
│ activityHistory []          │
│ isDeleted, deletedAt        │
│ createdAt, updatedAt        │
└──────────┬──────────────────┘
           │ 1:M
           ▼
┌───────────────────────────────┐         ┌──────────────────────────────┐
│          MEAL PLAN            │         │           MEAL               │
├───────────────────────────────┤         ├──────────────────────────────┤
│ _id (ObjectId) PK             │ M:M via │ _id (ObjectId) PK            │
│ user → User                   │◄───────►│ name, description            │
│ title (String)                │  days[] │ cuisine (String, indexed)    │
│ weekStartDate (Date)          │         │ mealType [breakfast|lunch|   │
│ days [                        │         │          dinner|snack]        │
│   day: mon..sun,              │         │ nutrition {                  │
│   meals: [{                   │         │   calories, protein, carbs,  │
│     mealType, meal→Meal,      │         │   fats, fiber, sugar, sodium,│
│     adherence: {              │         │   glycemicIndex              │
│       status: planned|eaten|  │         │ }                            │
│              skipped|replaced,│         │ ingredients [String]         │
│       replacedWith            │         │ allergens [String]           │
│     }                         │         │ isVegetarian, isVegan,       │
│   }]                          │         │ isGlutenFree, isDairyFree,   │
│ ]                             │         │ isNutFree                    │
│ nutritionSummary {            │         │ costLevel [low|medium|high]  │
│   calories, protein,          │         │ prepTimeMinutes, cookTime    │
│   carbs, fats                 │         │ skillLevel                   │
│ }                             │         │ appliances [String]          │
│ generatedBy [manual|ai]       │         │ image { publicId, url }      │
│ isActive (Boolean)            │         │ embeddingVector [Number]     │
│ createdAt, updatedAt          │         │ createdBy → User             │
└───────────────────────────────┘         │ likedBy [User refs]          │
                                          │ isActive, status             │
           ┌──────────────────────────────┤ reviewedBy → User            │
           │                              │ reviewedAt                   │
           │  1:M                         │ createdAt, updatedAt         │
           ▼                              └──────────────────────────────┘
┌──────────────────────────┐
│       CONSTRAINT         │
├──────────────────────────┤
│ _id (ObjectId) PK        │
│ user → User (1:1)        │
│ maxCookTime (Number)     │
│ skillLevel               │
│ appliances [String]      │
│ dietaryPreferences []    │
│ allergies []             │
│ goal (String)            │
│ budgetTier               │
│ createdAt, updatedAt     │
└──────────────────────────┘

┌──────────────────────────┐    ┌──────────────────────────┐
│       FEEDBACK           │    │      NOTIFICATION         │
├──────────────────────────┤    ├──────────────────────────┤
│ _id (ObjectId) PK        │    │ _id (ObjectId) PK         │
│ user → User              │    │ user → User               │
│ rating (1-5)             │    │ type (String)             │
│ category (String)        │    │ title, message            │
│ message (String)         │    │ isRead (Boolean)          │
│ createdAt                │    │ channel [email|sms|push]  │
└──────────────────────────┘    │ sentAt, createdAt         │
                                └──────────────────────────┘

┌──────────────────────────────────────────────────┐
│                  AI HISTORY (Flask DB)            │
├──────────────────────────────────────────────────┤
│ _id (ObjectId) PK                                │
│ username (String)          ← linked by username  │
│ action [chat | meal_analysis | weekly_plan |      │
│         health_risk_report | nutrition_impact]   │
│ data (Object)              ← AI service response │
│ createdAt                                        │
└──────────────────────────────────────────────────┘
```

---

## 👥 User Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Guest** | Unauthenticated visitor | Browse public meals |
| **User** | Registered account | Manage profile, create/browse meals, generate AI plans, view own analytics |
| **Admin** | Application administrator | All user permissions + manage all users, meals, notifications, export data |
| **Super Admin** | Highest privilege | All admin permissions + manage admin accounts, regenerate admin codes, view system info |

Role enforcement is handled via `auth.middleware.js` (JWT verification) and `role.middleware.js` (`adminOnly`, `superAdminOnly` guards).

---

## 📡 Complete API Reference

### Base URLs
| Service | Development | Production |
|---------|-------------|------------|
| Backend | `http://localhost:8000` | Render service URL |
| AI/ML Service | `http://localhost:5000` | Render service URL |
| Frontend | `http://localhost:5173` | `https://mealgenerator.me` |

---

### 🔐 Authentication – `/api/v1/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/signup` | None | Register new user |
| `POST` | `/login` | None | Login, returns JWT + refresh token |
| `POST` | `/logout` | ✅ JWT | Logout current user |
| `POST` | `/refresh-token` | None | Get new access token via refresh token |
| `POST` | `/password/request-otp` | None | Request OTP for password reset |
| `POST` | `/password/reset` | None | Reset password with OTP |
| `GET` | `/me` | ✅ JWT | Get current user profile |
| `PUT` | `/avatar` | ✅ JWT | Update profile avatar (multipart) |
| `PUT` | `/additional-data` | ✅ JWT | Store profile additional data |
| `PUT` | `/update` | ✅ JWT | Update user profile fields |
| `DELETE` | `/me` | ✅ JWT | Soft-delete own account |
| `GET` | `/activity` | ✅ JWT | Get user activity history |
| `GET` | `/activity-stats` | ✅ JWT | Get activity statistics |
| `GET` | `/internal/ai/user-context/:userId` | Internal | AI service: get user context |

---

### 🍽️ Meals – `/api/v1/meals`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | None | List/search meals (pagination, filters) |
| `POST` | `/` | ✅ JWT | Create new meal (with image upload) |
| `GET` | `/:mealId` | None | Get meal details |
| `PUT` | `/:mealId` | ✅ JWT | Update meal (with image) |
| `DELETE` | `/:mealId` | ✅ JWT | Delete meal |
| `POST` | `/:mealId/like` | ✅ JWT | Toggle like/unlike a meal |

---

### 📅 Meal Plans – `/api/v1/meal-plans`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | ✅ JWT | Create meal plan |
| `GET` | `/` | ✅ JWT | Get all my meal plans |
| `GET` | `/:planId` | ✅ JWT | Get specific meal plan |
| `PUT` | `/:planId` | ✅ JWT | Update meal plan |
| `DELETE` | `/:planId` | ✅ JWT | Delete meal plan |
| `POST` | `/:planId/adhere` | ✅ JWT | Mark a meal as eaten |
| `POST` | `/:planId/skip` | ✅ JWT | Skip a meal |
| `POST` | `/:planId/replace` | ✅ JWT | Replace a meal in plan |

---

### 🤖 AI Recommendations – `/api/v1/recommendations`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/generate` | ✅ JWT | Generate AI-powered meal plan (calls Flask) |
| `GET` | `/history` | ✅ JWT | Get past AI recommendation history |

---

### 🛒 Grocery – `/api/v1/meal-plans/:id/...`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/grocery-list` | ✅ JWT | Generate grocery list from meal plan |
| `GET` | `/cost-estimate` | ✅ JWT | Estimate grocery cost |
| `POST` | `/missing-items` | ✅ JWT | Check missing grocery items |
| `GET` | `/grocery-summary` | ✅ JWT | Get grocery summary |
| `POST` | `/mark-purchased` | ✅ JWT | Mark items as purchased |
| `GET` | `/store-suggestions` | ✅ JWT | Get store-section suggestions |
| `GET` | `/budget-alternatives` | ✅ JWT | Get budget-friendly alternatives |

---

### 📊 Analytics – `/api/v1/analytics`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ✅ JWT | Get user analytics dashboard data |
| `GET` | `/export` | ✅ JWT | Export user data |
| `GET` | `/feedback` | ✅ JWT | Get feedback statistics |
| `GET` | `/constraints` | ✅ JWT | Get constraint statistics |
| `GET` | `/ai-interactions` | ✅ JWT | Get AI interaction statistics |
| `GET` | `/ai-interactions/history` | ✅ JWT | Get AI interaction history |
| `GET` | `/ai-interactions/dashboard` | ✅ JWT | Get AI dashboard summary |

---

### 🔔 Notifications – `/api/v1/notifications`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ✅ JWT | Get all notifications |
| `GET` | `/unread-count` | ✅ JWT | Get unread count |
| `GET` | `/latest` | ✅ JWT | Get latest notifications |
| `PATCH` | `/:notificationId/read` | ✅ JWT | Mark as read |
| `PATCH` | `/:notificationId/unread` | ✅ JWT | Mark as unread |
| `PATCH` | `/mark-all-read` | ✅ JWT | Mark all as read |
| `POST` | `/test-sms` | ✅ JWT | Test SMS notification |
| `GET` | `/sms-status` | ✅ JWT | Check SMS system status |

---

### 💬 Feedback – `/api/v1/feedback`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | ✅ JWT | Submit feedback |
| `GET` | `/` | ✅ JWT | Get my feedback history |

---

### ⚙️ Constraints – `/api/v1/constraints`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | ✅ JWT | Create or update dietary constraints |
| `GET` | `/` | ✅ JWT | Get my constraints |
| `DELETE` | `/` | ✅ JWT | Delete my constraints |

---

### 🛡️ Admin – `/api/v1/admin`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/dashboard/stats` | Admin | Dashboard statistics |
| `GET` | `/system/info` | Super Admin | System information |
| `GET` | `/activity/recent` | Admin | Recent activity log |
| `POST` | `/users/register-admin` | Super Admin | Register new admin |
| `GET` | `/users` | Admin | List all users |
| `GET` | `/users/:userId` | Admin | Get user by ID |
| `PUT` | `/users/:userId/role` | Super Admin | Update user role |
| `PUT` | `/users/:userId/status` | Admin | Activate/deactivate user |
| `DELETE` | `/users/:userId` | Admin | Delete user |
| `PUT` | `/users/:userId/restore` | Admin | Restore deleted user |
| `POST` | `/users/:userId/test-sms` | Admin | Test SMS for user |
| `GET` | `/meals` | Admin | List all meals |
| `PUT` | `/meals/:mealId/status` | Admin | Update meal status |
| `DELETE` | `/meals/:mealId` | Admin | Delete meal |
| `GET` | `/meal-plans` | Admin | List all meal plans |
| `DELETE` | `/meal-plans/:mealPlanId` | Admin | Delete meal plan |
| `GET` | `/constraints` | Admin | List all constraints |
| `DELETE` | `/constraints/:constraintId` | Admin | Delete constraint |
| `GET` | `/notifications` | Admin | List all notifications |
| `GET` | `/notifications/stats` | Admin | Notification statistics |
| `DELETE` | `/notifications/:notificationId` | Admin | Delete notification |
| `GET` | `/feedback` | Admin | List all feedback |
| `DELETE` | `/feedback/:feedbackId` | Admin | Delete feedback |
| `GET` | `/codes` | Super Admin | Get admin codes |
| `POST` | `/codes/regenerate` | Super Admin | Regenerate codes |
| `GET` | `/export/:type` | Admin | Export data (users/meals/etc) |

---

### 🔗 Internal ML Contract – `/api/ml`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/ml/user-context` | JWT | Get user ML context (Node→Flask) |
| `GET` | `/ml/meals` | JWT | Get meal catalog for ML |
| `GET` | `/ml/meals/stats` | JWT | Get meal catalog statistics |

---

### 🤖 AI/ML Service Endpoints (Flask – Port 5000)

#### Main API (prefix: `/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/analyze-meals` | Analyze meals: nutrition scoring, insights |
| `POST` | `/generate-weekly-plan` | Generate 7-day AI meal plan |
| `POST` | `/health-risk-report` | Health risk report from meal history |
| `POST` | `/chat/generateResponse` | AI chat with Groq (Llama 3.1-8b) |
| `GET` | `/history/<userId>` | Get AI interaction history |
| `GET` | `/weekly-plans/<userId>` | Get weekly plans history |
| `GET` | `/health-risk-reports/<userId>` | Get health risk reports history |
| `POST` | `/summarize-weekly-meal` | Summarize a weekly meal plan |
| `POST` | `/nutrition-impact-summary` | Nutrition impact of a weekly plan |

#### Analytics (prefix: `/analytics`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analytics/overview` | Overall analytics overview |
| `GET` | `/analytics/user/<userId>` | Per-user analytics |

#### Admin (prefix: `/api/admin`) – HMAC authenticated

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/ai-history` | All AI history |
| `GET` | `/api/admin/health-reports` | All health risk reports |
| `GET` | `/api/admin/meal-analysis` | All meal analyses |
| `GET` | `/api/admin/weekly-plans` | All weekly plans |
| `GET` | `/api/admin/chat-history` | All chat history |
| `GET` | `/api/admin/user-context` | All user context records |
| `GET` | `/api/admin/dashboard-stats` | Aggregated admin stats |
| `DELETE` | `/api/admin/delete-record` | Delete specific AI record |
| `POST` | `/api/admin/export-data` | Export AI data as Excel/JSON |

#### Internal Sync (prefix: `/internal`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/internal/sync-user-context` | Sync user context from Node |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18+
- **Python** v3.8+
- **MongoDB** Atlas or local instance
- **Git**

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Fenil412/SmartBite.git
cd SmartBite
```

### 2️⃣ Backend Setup (Node.js)
```bash
cd server
npm install
cp .env.sample .env
# Fill in .env values (MongoDB URI, JWT secrets, Cloudinary, Twilio, etc.)
npm run dev
```
**Runs on:** `http://localhost:8000`

### 3️⃣ AI/ML Service Setup (Python)
```bash
cd Models

# Create virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Fill in MONGODB_URI, GROQ_API_KEY, NODE_BACKEND_URL, INTERNAL_API_KEY

# Run development server
python -m app.main

# OR production
uvicorn app.main:app --host 0.0.0.0 --port 5000
```
**Runs on:** `http://localhost:5000`

### 4️⃣ Frontend Setup (React)
```bash
cd client
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000
# Set VITE_ML_API_URL=http://localhost:5000
npm run dev
```
**Runs on:** `http://localhost:5173`

### 5️⃣ Access the Application
| Service | URL |
|---------|-----|
| Frontend App | http://localhost:5173 |
| Backend API | http://localhost:8000/api/v1 |
| AI Service | http://localhost:5000 |
| Healthcheck | http://localhost:8000/api/v1/healthcheck |

---

## 📦 Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2 | UI framework |
| Vite | 7.x | Build tool & dev server |
| Tailwind CSS | 3.3 | Utility-first styling |
| Framer Motion | 10.x | Animations |
| React Router | 6.x | Client-side routing |
| Axios | 1.6 | HTTP client |
| TanStack Query | 4.x | Server state management |
| Zustand | 4.4 | Global state |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Schema validation |
| Lucide React | 0.294 | Icon library |
| ExcelJS + jsPDF | Latest | Export capabilities |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | ≥18 | JavaScript runtime |
| Express | 5.x | Web framework |
| MongoDB + Mongoose | 8.x | Database + ODM |
| JWT (jsonwebtoken) | 9.x | Authentication tokens |
| bcrypt | 6.x | Password hashing |
| Multer + Cloudinary | Latest | File/image uploads |
| Resend | 4.x | Email notifications |
| Twilio | 5.x | SMS notifications |
| node-cron | 4.x | Scheduled jobs |
| Axios | 1.x | HTTP client (Node→Flask) |
| validator | 13.x | Input validation |

### AI / ML Service
| Technology | Purpose |
|-----------|---------|
| Flask + Flask-CORS | Python web framework |
| PyMongo | MongoDB driver |
| sentence-transformers | Text embeddings |
| faiss-cpu | Vector similarity search |
| XGBoost | Calorie distribution prediction |
| PuLP | Linear programming / calorie optimization |
| pandas + numpy | Data processing |
| Groq API (Llama 3.1-8b-instant) | LLM chat & meal generation |
| pydantic | Schema validation |
| openpyxl + xlsxwriter | Data export |
| gunicorn | Production WSGI server |

---

## 🔒 Environment Variables

### Backend (`server/.env`)
```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
DB_NAME=smartbite

# CORS
CORS_ORIGIN=http://localhost:5173,https://mealgenerator.me
FRONTEND_ORIGIN=http://localhost:5173

# JWT
ACCESS_TOKEN_SECRET=your-access-secret-min-32-chars
REFRESH_TOKEN_SECRET=your-refresh-secret-min-32-chars
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Resend)
RESEND_API_KEY=re_...

# SMS (Twilio)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Flask AI Service
FLASK_AI_BASE_URL=http://localhost:5000
INTERNAL_HMAC_SECRET=your-hmac-secret-min-32-chars
NODE_INTERNAL_KEY=your-node-internal-key

# Admin
ADMIN_REGISTRATION_CODE=your-admin-code
SUPER_ADMIN_REGISTRATION_CODE=your-super-admin-code
```

### AI Service (`Models/.env`)
```env
MONGODB_URI=mongodb+srv://...
PORT=5000
CORS_ORIGIN=http://localhost:5173
GROQ_API_KEY=gsk_...
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
LOG_LEVEL=INFO
NODE_BACKEND_URL=http://localhost:8000
INTERNAL_API_KEY=your-internal-api-key
INTERNAL_HMAC_SECRET=your-hmac-secret
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:8000
VITE_ML_API_URL=http://localhost:5000
```

---

## 📝 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

*Built with ❤️ by [Fenil Chodvadiya](https://github.com/Fenil412) for a healthier world through intelligent nutrition 🍽️*
