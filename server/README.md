# SmartBite Backend Server 🚀

Node.js + Express REST API server for SmartBite. Handles authentication, meal/plan management, grocery generation, analytics, notifications, and acts as gateway to the Python Flask AI service.

---

## 📁 Directory Structure

```
server/
├── src/
│   ├── app.js                       # Express app: CORS, middleware, route mounting
│   ├── index.js                     # Server entry point (DB connect + listen)
│   ├── constants.js
│   │
│   ├── controllers/                 # Request handlers (business logic)
│   │   ├── user.controller.js       # Auth, profile, activity
│   │   ├── admin.controller.js      # Admin: users, meals, plans, export
│   │   ├── meal.controller.js       # Meal CRUD + like toggle
│   │   ├── mealPlan.controller.js   # Plan CRUD + adhere/skip/replace
│   │   ├── recommendation.controller.js # AI plan generation (calls Flask)
│   │   ├── grocery.controller.js    # Grocery list, cost, suggestions
│   │   ├── analytics.controller.js  # Analytics + AI interaction stats
│   │   ├── notification.controller.js # Notifications + SMS
│   │   ├── feedback.controller.js   # Submit and read feedback
│   │   ├── constraint.controller.js # Dietary constraints
│   │   ├── mlContract.controller.js # Internal ML context/catalog
│   │   └── healthcheck.controller.js
│   │
│   ├── models/                      # Mongoose schemas
│   │   ├── user.model.js            # User: auth, profile, preferences, constraints
│   │   ├── meal.model.js            # Meal: nutrition, ingredients, diet flags
│   │   ├── mealPlan.model.js        # MealPlan: weekly schedule + adherence
│   │   ├── constraint.model.js      # Per-user cooking/diet constraints
│   │   ├── feedback.model.js        # User feedback entries
│   │   ├── notification.model.js    # Notification records
│   │   └── aiHistory.model.js       # AI interaction history log
│   │
│   ├── routes/                      # Route definitions
│   │   ├── user.routes.js           # /api/v1/users
│   │   ├── admin.routes.js          # /api/v1/admin
│   │   ├── meal.routes.js           # /api/v1/meals
│   │   ├── mealPlan.routes.js       # /api/v1/meal-plans
│   │   ├── recommendation.routes.js # /api/v1/recommendations
│   │   ├── grocery.routes.js        # /api/v1/meal-plans/:id/grocery-*
│   │   ├── analytics.routes.js      # /api/v1/analytics
│   │   ├── notification.routes.js   # /api/v1/notifications
│   │   ├── feedback.routes.js       # /api/v1/feedback
│   │   ├── constraint.routes.js     # /api/v1/constraints
│   │   ├── mlContract.routes.js     # /api/ml (internal)
│   │   ├── email.routes.js          # /api/v1/email
│   │   └── healthcheck.routes.js    # /api/v1/healthcheck
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js       # JWT verification
│   │   ├── role.middleware.js       # adminOnly, superAdminOnly guards
│   │   ├── multer.middleware.js     # File upload (disk storage)
│   │   └── error.middleware.js      # Global error handler
│   │
│   ├── services/
│   │   ├── aiSync.service.js        # Sync user context → Flask
│   │   ├── notification.service.js  # Email (Resend) + SMS (Twilio)
│   │   ├── mlContract.service.js    # Build ML context payloads
│   │   ├── grocery.service.js       # Grocery logic
│   │   └── cron/
│   │       └── weeklySummary.cron.js # Weekly email summaries (node-cron)
│   │
│   ├── utils/
│   │   ├── ApiResponse.js           # Standardized success response
│   │   ├── ApiError.js              # Custom error class
│   │   ├── mailer.js                # Resend email wrapper
│   │   ├── cloudinary.js            # Cloudinary upload/delete
│   │   └── ...
│   │
│   ├── workers/
│   │   └── notification.retry.js    # Retry failed notification deliveries
│   │
│   └── db/
│       └── index.js                 # MongoDB connection via Mongoose
│
├── uploads/                         # Temp upload storage (Multer)
├── public/                          # Static assets
├── .env.sample                      # Environment variable template
└── package.json
```

---

## 🗄️ Database Models

### User Model (`user.model.js`)
```
fields: email, username, password (bcrypt), name, phone, avatar{publicId,url},
        roles[user|admin|super_admin], isVerified, locale, timezone,
        tokenVersion, refreshToken, passwordChangedAt, passwordResetOtp,
        preferences{units, budgetTier, preferredCuisines},
        profile{age, heightCm, weightKg, gender, activityLevel, goal,
                dietaryPreferences, dietaryRestrictions, allergies, medicalNotes},
        notificationPreferences{email, sms, events{signup,login,password,mealPlan,weeklySummary}},
        favoriteMeals[Meal refs], constraints{maxCookTime, skillLevel, appliances},
        activityHistory[], isDeleted, deletedAt, createdAt, updatedAt
```

### Meal Model (`meal.model.js`)
```
fields: name, description, cuisine, mealType[breakfast|lunch|dinner|snack],
        nutrition{calories, protein, carbs, fats, fiber, sugar, sodium, glycemicIndex},
        ingredients[], allergens[], isVegetarian, isVegan, isGlutenFree,
        isDairyFree, isNutFree, costLevel, prepTimeMinutes, cookTime,
        skillLevel, appliances[], image{publicId,url}, embeddingVector[],
        createdBy→User, likedBy[User], isActive, status[pending|approved|rejected],
        reviewedBy→User, reviewedAt, createdAt, updatedAt
```

### MealPlan Model (`mealPlan.model.js`)
```
fields: user→User, title, weekStartDate,
        days[{
          day[monday..sunday],
          meals[{mealType, meal→Meal, adherence{status[planned|eaten|skipped|replaced], replacedWith}}]
        }],
        nutritionSummary{calories, protein, carbs, fats},
        generatedBy[manual|ai], isActive, createdAt, updatedAt
```

---

## 📡 API Endpoints

### Authentication – `/api/v1/users`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | – | Register new user |
| POST | `/login` | – | Login → JWT + refresh token |
| POST | `/logout` | JWT | Logout |
| POST | `/refresh-token` | – | Get new access token |
| POST | `/password/request-otp` | – | Send OTP for password reset |
| POST | `/password/reset` | – | Reset password with OTP |
| GET | `/me` | JWT | Get current user |
| PUT | `/avatar` | JWT | Update avatar (multipart upload) |
| PUT | `/additional-data` | JWT | Store additional profile data |
| PUT | `/update` | JWT | Update user profile |
| DELETE | `/me` | JWT | Soft-delete account |
| GET | `/activity` | JWT | Activity history |
| GET | `/activity-stats` | JWT | Activity statistics |

### Meals – `/api/v1/meals`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | – | List meals (paginated, filtered) |
| POST | `/` | JWT | Create meal (with image) |
| GET | `/:mealId` | – | Get meal detail |
| PUT | `/:mealId` | JWT | Update meal |
| DELETE | `/:mealId` | JWT | Delete meal |
| POST | `/:mealId/like` | JWT | Toggle like |

### Meal Plans – `/api/v1/meal-plans`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | JWT | Create plan |
| GET | `/` | JWT | My meal plans |
| GET | `/:planId` | JWT | Plan details |
| PUT | `/:planId` | JWT | Update plan |
| DELETE | `/:planId` | JWT | Delete plan |
| POST | `/:planId/adhere` | JWT | Mark meal eaten |
| POST | `/:planId/skip` | JWT | Skip meal |
| POST | `/:planId/replace` | JWT | Replace meal |

### Recommendations – `/api/v1/recommendations`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/generate` | JWT | Generate AI meal plan (proxies Flask) |
| GET | `/history` | JWT | Past AI recommendation history |

### Grocery – `/api/v1/meal-plans/:id/...`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/grocery-list` | JWT | Generate grocery list |
| GET | `/cost-estimate` | JWT | Estimate grocery cost |
| POST | `/missing-items` | JWT | Check missing items |
| GET | `/grocery-summary` | JWT | Grocery summary |
| POST | `/mark-purchased` | JWT | Mark items purchased |
| GET | `/store-suggestions` | JWT | Store-section suggestions |
| GET | `/budget-alternatives` | JWT | Budget alternatives |

### Analytics – `/api/v1/analytics`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | JWT | Dashboard analytics |
| GET | `/export` | JWT | Export user data |
| GET | `/feedback` | JWT | Feedback statistics |
| GET | `/constraints` | JWT | Constraint statistics |
| GET | `/ai-interactions` | JWT | AI interaction stats |
| GET | `/ai-interactions/history` | JWT | AI interaction history |
| GET | `/ai-interactions/dashboard` | JWT | AI dashboard summary |

### Notifications – `/api/v1/notifications`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | JWT | All notifications |
| GET | `/unread-count` | JWT | Count of unread |
| GET | `/latest` | JWT | Latest notifications |
| PATCH | `/:id/read` | JWT | Mark as read |
| PATCH | `/:id/unread` | JWT | Mark as unread |
| PATCH | `/mark-all-read` | JWT | Mark all read |
| POST | `/test-sms` | JWT | Test SMS |
| GET | `/sms-status` | JWT | SMS system status |

### Feedback – `/api/v1/feedback`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | JWT | Submit feedback |
| GET | `/` | JWT | My feedback |

### Constraints – `/api/v1/constraints`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | JWT | Upsert constraints |
| GET | `/` | JWT | Get my constraints |
| DELETE | `/` | JWT | Delete constraints |

### Admin – `/api/v1/admin`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/stats` | Admin | Dashboard stats |
| GET | `/system/info` | SuperAdmin | System info |
| GET | `/activity/recent` | Admin | Recent activity |
| POST | `/users/register-admin` | SuperAdmin | Create admin |
| GET | `/users` | Admin | All users |
| GET | `/users/:userId` | Admin | User by ID |
| PUT | `/users/:userId/role` | SuperAdmin | Update role |
| PUT | `/users/:userId/status` | Admin | Toggle status |
| DELETE | `/users/:userId` | Admin | Delete user |
| PUT | `/users/:userId/restore` | Admin | Restore user |
| POST | `/users/:userId/test-sms` | Admin | Test SMS |
| GET | `/meals` | Admin | All meals |
| PUT | `/meals/:mealId/status` | Admin | Update meal status |
| DELETE | `/meals/:mealId` | Admin | Delete meal |
| GET | `/meal-plans` | Admin | All plans |
| DELETE | `/meal-plans/:id` | Admin | Delete plan |
| GET | `/constraints` | Admin | All constraints |
| DELETE | `/constraints/:id` | Admin | Delete constraint |
| GET | `/notifications` | Admin | All notifications |
| GET | `/notifications/stats` | Admin | Notification stats |
| DELETE | `/notifications/:id` | Admin | Delete notification |
| GET | `/feedback` | Admin | All feedback |
| DELETE | `/feedback/:id` | Admin | Delete feedback |
| GET | `/codes` | SuperAdmin | Admin codes |
| POST | `/codes/regenerate` | SuperAdmin | Regenerate codes |
| GET | `/export/:type` | Admin | Export data |

---

## 🚀 Setup & Running

```bash
cd server
npm install

# Copy and configure env
cp .env.sample .env

# Development (auto-reload)
npm run dev

# Production
npm start
```

**Required environment variables:**
```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
ACCESS_TOKEN_SECRET=...
REFRESH_TOKEN_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
FLASK_AI_BASE_URL=http://localhost:5000
INTERNAL_HMAC_SECRET=...
ADMIN_REGISTRATION_CODE=...
SUPER_ADMIN_REGISTRATION_CODE=...
```

---

## 📦 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | 5.x | Web framework |
| mongoose | 8.x | MongoDB ODM |
| jsonwebtoken | 9.x | JWT auth tokens |
| bcrypt | 6.x | Password hashing |
| cloudinary | 2.x | Image storage |
| multer | 2.x | File uploads |
| resend | 4.x | Email delivery |
| twilio | 5.x | SMS delivery |
| node-cron | 4.x | Scheduled tasks |
| axios | 1.x | HTTP client (→Flask) |
| validator | 13.x | Input validation |
| mongoose-paginate-v2 | Latest | Pagination plugin |

---

## 👥 User Roles

| Role | Middleware | Permissions |
|------|-----------|-------------|
| `user` | JWT only | Own data only |
| `admin` | `adminOnly` | Manage all content + users |
| `super_admin` | `superAdminOnly` | Admin + system config |

---

*Part of the [SmartBite](../README.md) project*
