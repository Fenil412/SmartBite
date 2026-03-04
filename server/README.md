# SmartBite Backend Server 🚀

A robust Node.js/Express backend server for the SmartBite AI-powered meal planning application with comprehensive API endpoints, authentication, database management, and AI integration.

## 🌟 Features

### � User Roles & Permissions
SmartBite backend recognizes the following roles, enforced via middleware:

- **Guest** – unauthenticated; limited to public endpoints.
- **User** – standard account able to manage their own profile, meals, plans, etc.
- **Admin** – can manage users, meals, meal plans, view analytics, and moderate content.
- **Super‑Admin** – full privileges including admin management and system configuration.

### �🔐 Authentication & Security
- **JWT Authentication**: Secure token-based authentication system with refresh tokens
- **Password Hashing**: bcrypt for secure password storage with salt rounds
- **Role-based Access Control**: Admin, user, and super admin roles with granular permissions
- **Rate Limiting**: API rate limiting to prevent abuse and DDoS attacks
- **CORS Configuration**: Secure cross-origin resource sharing with environment-based origins
- **Input Validation**: Comprehensive request validation and sanitization using Joi/express-validator
- **Security Headers**: Helmet.js for security headers and XSS protection

### 📊 Database Management
- **MongoDB Integration**: Mongoose ODM with connection pooling and error handling
- **User Management**: Complete user profile, preferences, and authentication management
- **Meal Database**: Comprehensive meal, nutrition, and ingredient data storage
- **Analytics Storage**: User activity, nutrition tracking, and behavioral analytics
- **File Uploads**: Multer integration with Cloudinary for image and document uploads
- **Data Validation**: Schema validation with custom validators and error handling

### 🍽️ Meal & Nutrition APIs
- **Meal CRUD Operations**: Create, read, update, delete meals with advanced filtering
- **Nutrition Analysis**: Detailed nutritional information processing and calculations
- **Meal Planning**: Weekly meal plan generation, optimization, and management
- **Grocery Lists**: Automatic grocery list generation from meal plans with cost estimation
- **Dietary Restrictions**: Support for allergies, preferences, and custom dietary requirements
- **Recipe Management**: Recipe storage, scaling, and nutritional analysis

### 🤖 AI Integration & ML Services
- **ML Model Integration**: Seamless connection to Python ML services via HTTP APIs
- **AI Chat Interface**: Proxy to Groq AI services for nutrition insights and recommendations
- **Recommendation Engine**: Personalized meal recommendations using collaborative and content-based filtering
- **Health Analytics**: AI-powered health insights, risk assessments, and nutritional reports
- **Weekly Planning**: AI-optimized weekly meal plans considering user preferences and constraints
- **Nutrition Impact Analysis**: ML-based analysis of dietary choices on health outcomes

### 📈 Analytics & Reporting
- **User Analytics**: Comprehensive user activity tracking and behavioral analysis
- **Nutrition Tracking**: Detailed nutritional analysis, trends, and goal tracking
- **Admin Dashboard**: Complete admin analytics, user management, and system monitoring
- **Performance Metrics**: API performance monitoring and database query optimization
- **Export Capabilities**: PDF and Excel export for reports and meal plans

### 🔄 Background Services
- **Notification System**: Email and SMS notifications with retry mechanisms
- **Cron Jobs**: Scheduled tasks for data cleanup, analytics, and user engagement
- **Queue Management**: Background job processing for heavy computations
- **Cache Management**: Redis integration for session management and data caching

## 🏗️ Architecture

### System Overview
The backend sits between the React frontend and the database/ML services. It exposes REST APIs, handles business logic, enforces security, and forwards requests to the Python ML service when required.

```
[React Frontend] <--> [Express API] <--> [MongoDB]
                             |
                             +--> [Flask/ML Service]
```

### Directory Structure
```
server/
├── src/
│   ├── controllers/          # Request handlers and business logic
│   │   ├── admin.controller.js
│   │   ├── analytics.controller.js
│   │   ├── meal.controller.js
│   │   ├── mealPlan.controller.js
│   │   ├── user.controller.js
│   │   └── ...
│   ├── models/              # Mongoose schemas and models
│   │   ├── user.model.js
│   │   ├── meal.model.js
│   │   ├── mealPlan.model.js
│   │   └── ...
│   ├── routes/              # API route definitions
│   │   ├── auth.routes.js
│   │   ├── meal.routes.js
│   │   ├── admin.routes.js
│   │   └── ...
│   ├── middlewares/         # Custom middleware functions
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── error.middleware.js
│   │   └── ...
│   ├── services/            # Business logic and external integrations
│   │   ├── aiSync.service.js
│   │   ├── notification.service.js
│   │   ├── mlContract.service.js
│   │   └── ...
│   ├── utils/               # Utility functions and helpers
│   │   ├── mailer.js
│   │   ├── cloudinary.js
│   │   ├── ApiResponse.js
│   │   └── ...
│   ├── workers/             # Background job processors
│   └── db/                  # Database configuration and connection
├── uploads/                 # Temporary file storage
├── public/                  # Static assets
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (v5.0+)
- Redis (optional, for caching)
- Cloudinary account (for image uploads)

### Installation

1. **Clone and navigate to server directory:**
```bash
cd server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Configuration:**
Create a `.env` file based on `.env.sample`:
```bash
cp .env.sample .env
```

Configure the following variables:
```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/smartbite
DB_NAME=smartbite

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRY=30d

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AI/ML Services
ML_SERVICE_URL=http://localhost:5000
GROQ_API_URL=http://localhost:5001

# Redis (optional)
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:3000
```

4. **Start the server:**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `POST /api/v1/users/refresh-token` - Refresh access token
- `POST /api/v1/users/forgot-password` - Password reset request
- `POST /api/v1/users/reset-password` - Password reset confirmation

### User Management
- `GET /api/v1/users/profile` - Get user profile
- `PATCH /api/v1/users/profile` - Update user profile
- `POST /api/v1/users/avatar` - Upload profile avatar
- `GET /api/v1/users/preferences` - Get dietary preferences
- `PATCH /api/v1/users/preferences` - Update dietary preferences

### Meals & Nutrition
- `GET /api/v1/meals` - Get meals with filtering and pagination
- `POST /api/v1/meals` - Create new meal
- `GET /api/v1/meals/:id` - Get meal details
- `PATCH /api/v1/meals/:id` - Update meal
- `DELETE /api/v1/meals/:id` - Delete meal
- `POST /api/v1/meals/:id/favorite` - Toggle meal favorite

### Meal Planning
- `GET /api/v1/meal-plans` - Get user meal plans
- `POST /api/v1/meal-plans` - Create meal plan
- `GET /api/v1/meal-plans/:id` - Get meal plan details
- `PATCH /api/v1/meal-plans/:id` - Update meal plan
- `DELETE /api/v1/meal-plans/:id` - Delete meal plan
- `POST /api/v1/meal-plans/generate` - AI-generate meal plan

### AI & ML Integration
- `POST /api/v1/ai/chat` - AI chat for nutrition advice
- `POST /api/v1/ai/meal-analysis` - Analyze meal nutrition
- `POST /api/v1/ai/weekly-plan` - Generate weekly meal plan
- `POST /api/v1/ai/health-risk` - Health risk assessment
- `GET /api/v1/ai/history` - Get AI interaction history

### Analytics & Reports
- `GET /api/v1/analytics/dashboard` - User dashboard analytics
- `GET /api/v1/analytics/nutrition` - Nutrition tracking data
- `GET /api/v1/analytics/goals` - Goal progress tracking
- `POST /api/v1/analytics/export` - Export analytics data

### Admin Endpoints
- `GET /api/v1/admin/users` - Get all users (admin only)
- `GET /api/v1/admin/analytics` - System analytics
- `POST /api/v1/admin/regenerate-code` - Regenerate admin codes
- `GET /api/v1/admin/ai-data` - AI service data overview

## 🔧 Configuration

### Environment Variables
The server uses environment variables for configuration. Key variables include:

- **Server**: `PORT`, `NODE_ENV`
- **Database**: `MONGODB_URI`, `DB_NAME`
- **Authentication**: `JWT_SECRET`, `JWT_EXPIRY`
- **File Storage**: Cloudinary configuration
- **Email**: SMTP configuration
- **External Services**: ML service URLs

### Database Models
- **User**: Authentication, profile, preferences
- **Meal**: Meal data, nutrition, ingredients
- **MealPlan**: Weekly plans, schedules
- **Notification**: User notifications and alerts
- **Feedback**: User feedback and ratings
- **Constraint**: Dietary restrictions and preferences

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## 📊 Monitoring & Logging

- **Request Logging**: Morgan middleware for HTTP request logging
- **Error Tracking**: Comprehensive error handling and logging
- **Performance Monitoring**: API response time tracking
- **Health Checks**: `/health` endpoint for service monitoring

## 🔒 Security Features

- **Input Sanitization**: XSS and injection prevention
- **Rate Limiting**: Prevent API abuse
- **CORS Configuration**: Secure cross-origin requests
- **Helmet Integration**: Security headers
- **JWT Security**: Secure token handling with refresh mechanism

## 🚀 Deployment

### Production Deployment
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up reverse proxy (Nginx)
4. Configure SSL certificates
5. Set up monitoring and logging

### Docker Deployment
```bash
docker build -t smartbite-server .
docker run -p 8000:8000 smartbite-server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for healthy living and smart nutrition management**
