# SmartBite Frontend Client ⚛️

React 18 + Vite frontend for SmartBite. A single-page application with AI-powered meal planning, nutrition analysis, grocery management, analytics dashboard, and an admin panel.

---

## 📁 Directory Structure

```
client/
├── index.html                       # Vite entry HTML
├── vite.config.js                   # Vite + proxy config
├── tailwind.config.js               # Tailwind theme config
├── postcss.config.js
├── .env.example                     # Environment variable template
├── package.json
│
├── public/                          # Static assets
│
└── src/
    ├── main.jsx                     # React entry point (render + providers)
    ├── App.jsx                      # Root router, route definitions
    ├── index.css                    # Global CSS (custom cursor, scrollbar, etc.)
    │
    ├── api/                         # Axios instance
    │   └── axios.js                 # Base axios config with interceptors
    │
    ├── components/                  # Reusable UI components (35+)
    │   ├── Layout.jsx               # App shell (sidebar + content area)
    │   ├── Sidebar.jsx              # Responsive collapsible sidebar
    │   ├── LoadingSpinner.jsx       # Loading state component
    │   ├── ProtectedRoute.jsx       # Auth guard HOC
    │   ├── AdminRoute.jsx           # Admin guard HOC
    │   ├── Navbar.jsx               # Top navigation bar
    │   ├── MealCard.jsx             # Meal display card
    │   ├── NutritionChart.jsx       # Chart components
    │   ├── NotificationBell.jsx     # Notification dropdown
    │   └── ...                      # Additional UI components
    │
    ├── contexts/                    # React Context providers
    │   ├── AuthContext.jsx          # Auth state: user, login, logout
    │   ├── ThemeContext.jsx         # Dark / light mode toggle
    │   └── NotificationContext.jsx  # Notification state
    │
    ├── hooks/                       # Custom React hooks
    │   ├── useAuth.js               # Auth context consumer
    │   ├── useCustomCursor.js       # Animated cursor system
    │   └── useNotifications.js      # Notification polling
    │
    ├── pages/                       # Route-level page components
    │   ├── auth/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── ForgotPassword.jsx
    │   │
    │   ├── dashboard/
    │   │   └── Dashboard.jsx        # Home overview with stats
    │   │
    │   ├── meals/
    │   │   ├── MealList.jsx         # Browse/search meals
    │   │   ├── MealDetail.jsx       # Single meal view
    │   │   ├── CreateMeal.jsx       # Add new meal form
    │   │   └── EditMeal.jsx
    │   │
    │   ├── mealplan/
    │   │   ├── MealPlanList.jsx     # My meal plans
    │   │   ├── MealPlanDetail.jsx   # Weekly plan view + adherence
    │   │   └── CreateMealPlan.jsx
    │   │
    │   ├── ai/
    │   │   ├── AIChat.jsx           # Groq-powered chat assistant
    │   │   ├── MealAnalysis.jsx     # Per-meal nutrition analysis
    │   │   ├── WeeklyPlanGenerator.jsx # AI weekly plan builder
    │   │   ├── HealthRiskReport.jsx # Health risk assessment
    │   │   └── NutritionImpact.jsx  # Nutrition impact summary
    │   │
    │   ├── grocery/
    │   │   └── GroceryList.jsx      # Grocery list from meal plan
    │   │
    │   ├── analytics/
    │   │   └── Analytics.jsx        # Charts, AI stats, history
    │   │
    │   ├── profile/
    │   │   └── Profile.jsx          # User profile + preferences
    │   │
    │   ├── notifications/
    │   │   └── Notifications.jsx    # Notification center
    │   │
    │   └── admin/
    │       ├── AdminDashboard.jsx   # Admin overview + stats
    │       ├── UserManagement.jsx   # User list + role/status edit
    │       ├── MealManagement.jsx   # Content moderation
    │       ├── MealPlanManagement.jsx
    │       ├── FeedbackManagement.jsx
    │       ├── NotificationManagement.jsx
    │       ├── AIDataManagement.jsx # AI history, chat, health data
    │       └── Analytics.jsx        # Admin analytics view
    │
    ├── services/                    # API modules (15 files)
    │   ├── authService.js           # Login, register, logout, token refresh
    │   ├── userService.js           # Profile, avatar, activity
    │   ├── mealService.js           # Meal CRUD, like toggle
    │   ├── mealPlanService.js       # Plan CRUD, adhere/skip/replace
    │   ├── recommendationService.js # AI plan generation
    │   ├── groceryService.js        # Grocery list, cost, alternatives
    │   ├── analyticsService.js      # Analytics + AI interaction stats
    │   ├── notificationService.js   # Notifications + mark read
    │   ├── feedbackService.js       # Submit / read feedback
    │   ├── constraintService.js     # Constraints upsert/get/delete
    │   ├── adminService.js          # Admin operations
    │   ├── aiService.js             # Chat, analysis, weekly plan (→Flask)
    │   ├── flaskService.js          # Direct Flask ML endpoints
    │   └── exportService.js         # PDF/Excel export utilities
    │
    ├── store/                       # Zustand state
    │   └── useStore.js              # Global app store
    │
    ├── styles/                      # Extra CSS
    │   └── admin-responsive.css     # Admin panel responsive overrides
    │
    └── utils/                       # Utilities
        └── helpers.js               # Date, format, validation helpers
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.2 | UI framework with hooks |
| **Vite** | 7.x | Build tool & dev server |
| **React Router DOM** | 6.x | Client-side routing |
| **Tailwind CSS** | 3.3 | Utility-first CSS |
| **Framer Motion** | 10.x | Page & component animations |
| **Axios** | 1.6 | HTTP client with interceptors |
| **TanStack Query** | 4.x | Server state caching & sync |
| **Zustand** | 4.4 | Lightweight global state |
| **React Hook Form** | 7.x | Form state & validation |
| **Zod** | 3.x | Schema-based validation |
| **Lucide React** | 0.294 | Icon library |
| **ExcelJS** | 4.x | Excel export |
| **jsPDF** | 3.x | PDF export |
| **clsx + tailwind-merge** | Latest | Conditional class utilities |

---

## 🚀 Setup & Running

```bash
cd client
npm install

# Copy env file
cp .env.example .env
```

**Configure `.env`:**
```env
VITE_API_URL=http://localhost:8000
VITE_ML_API_URL=http://localhost:5000
```

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

**Runs on:** `http://localhost:5173`

---

## 🧭 Application Routes

| Path | Component | Access |
|------|-----------|--------|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/forgot-password` | ForgotPassword | Public |
| `/dashboard` | Dashboard | Auth |
| `/meals` | MealList | Auth |
| `/meals/:id` | MealDetail | Auth |
| `/meals/create` | CreateMeal | Auth |
| `/meal-plans` | MealPlanList | Auth |
| `/meal-plans/:id` | MealPlanDetail | Auth |
| `/ai/chat` | AIChat | Auth |
| `/ai/analyze` | MealAnalysis | Auth |
| `/ai/weekly-plan` | WeeklyPlanGenerator | Auth |
| `/ai/health-risk` | HealthRiskReport | Auth |
| `/ai/nutrition-impact` | NutritionImpact | Auth |
| `/grocery/:planId` | GroceryList | Auth |
| `/analytics` | Analytics | Auth |
| `/profile` | Profile | Auth |
| `/notifications` | Notifications | Auth |
| `/admin` | AdminDashboard | Admin |
| `/admin/users` | UserManagement | Admin |
| `/admin/meals` | MealManagement | Admin |
| `/admin/ai-data` | AIDataManagement | Admin |

---

## 🔒 Auth Flow

1. User submits login form → `POST /api/v1/users/login`
2. Server returns `accessToken` (cookie) + `refreshToken` (cookie)
3. Axios interceptor attaches cookies with `withCredentials: true`
4. On 401, interceptor auto-calls `POST /api/v1/users/refresh-token`
5. `AuthContext` stores user object; `ProtectedRoute` redirects unauthenticated users

---

## 🎨 Design System

- **Custom Cursor**: Animated cursor via `useCustomCursor.js` hook
- **Dark/Light Theme**: System preference detection + toggle via `ThemeContext`
- **Responsive**: Mobile-first design; collapsible sidebar for small screens
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Consistent UI**: Tailwind utility classes with custom theme in `tailwind.config.js`

---

*Part of the [SmartBite](../README.md) project*