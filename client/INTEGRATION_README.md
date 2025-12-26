# SmartBite Frontend - Backend Integration

## 🚀 Complete Authentication & User Management Integration

This frontend application provides a complete integration with the SmartBite backend API, implementing all user routes with proper authentication, state management, and UI components.

## 📋 Implemented Features

### ✅ Authentication System
- **JWT-based authentication** with access tokens in memory
- **Automatic token refresh** using refresh tokens
- **Protected routes** with redirect to login
- **Persistent sessions** across browser refreshes
- **Auto-logout** on token expiration

### ✅ User Management Pages
- **Login Page** (`/login`) → `POST /api/v1/users/login`
- **Signup Page** (`/signup`) → `POST /api/v1/users/signup`
- **Forgot Password** (`/forgot-password`) → `POST /api/v1/users/password/request-otp`
- **Reset Password** (`/reset-password`) → `POST /api/v1/users/password/reset`
- **Dashboard** (`/dashboard`) → `GET /api/v1/users/me`
- **Profile Page** (`/dashboard/profile`) → `PUT /api/v1/users/avatar`, `DELETE /api/v1/users/me`
- **Activity Page** (`/dashboard/history`) → `GET /api/v1/users/activity`

### ✅ API Integration
- **Centralized API service** with Axios interceptors
- **Automatic token attachment** to requests
- **Error handling** with user-friendly messages
- **Loading states** and form validation
- **Toast notifications** for success/error feedback

## 🏗️ Architecture

### API Layer (`/src/services/`)
```
api.js           # Axios instance with interceptors
userService.js   # All user-related API calls
```

### State Management (`/src/contexts/`)
```
AuthContext.jsx  # Authentication state & methods
ToastContext.jsx # Global notification system
```

### Pages (`/src/pages/`)
```
auth/
├── LoginPage.jsx
├── SignupPage.jsx
├── ForgotPasswordPage.jsx
└── ResetPasswordPage.jsx

DashboardPage.jsx    # Protected dashboard
ProfilePage.jsx      # Profile management
ActivityPage.jsx     # User activity history
```

### Components (`/src/components/`)
```
ProtectedRoute.jsx   # Route protection
LoadingSpinner.jsx   # Loading states
Sidebar.jsx          # Navigation with auth
Layout.jsx           # Main app layout
```

## 🔐 Security Implementation

### Token Management
- **Access tokens** stored in memory (not localStorage)
- **Refresh tokens** handled via HTTP-only cookies
- **Automatic refresh** on 401 responses
- **Clean logout** with token cleanup

### Request Flow
```
1. User makes request
2. Interceptor adds Bearer token
3. If 401 response → try refresh token
4. If refresh succeeds → retry original request
5. If refresh fails → logout user
```

## 🎨 UI/UX Features

### Form Validation
- **Real-time validation** with error messages
- **Disabled states** during submission
- **Loading spinners** for async operations
- **Success/error toasts** for feedback

### Responsive Design
- **Mobile-first** approach
- **Collapsible sidebar** on small screens
- **Touch-friendly** interactions
- **Dark/light theme** support

### Accessibility
- **WCAG compliant** form labels
- **Keyboard navigation** support
- **Screen reader** friendly
- **Focus management** for modals

## 📡 Backend API Mapping

| Frontend Route | Backend Endpoint | Method | Purpose |
|---------------|------------------|---------|---------|
| `/login` | `/api/v1/users/login` | POST | User authentication |
| `/signup` | `/api/v1/users/signup` | POST | User registration |
| `/forgot-password` | `/api/v1/users/password/request-otp` | POST | Request password reset |
| `/reset-password` | `/api/v1/users/password/reset` | POST | Reset password with OTP |
| `/dashboard` | `/api/v1/users/me` | GET | Get user profile |
| Profile Avatar | `/api/v1/users/avatar` | PUT | Upload profile picture |
| Delete Account | `/api/v1/users/me` | DELETE | Delete user account |
| Activity History | `/api/v1/users/activity` | GET | Get user activity |
| Token Refresh | `/api/v1/users/refresh-token` | POST | Refresh access token |
| Logout | `/api/v1/users/logout` | POST | User logout |

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Update `.env` with your backend URL:
```
VITE_API_URL=http://localhost:8000/api/v1
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## 🔧 Configuration

### API Configuration (`/src/services/api.js`)
- **Base URL**: Configurable via environment variable
- **Timeout**: 10 seconds default
- **Credentials**: Enabled for cookie-based refresh tokens
- **Interceptors**: Automatic token handling

### Authentication Flow
1. **Login** → Store access token in memory
2. **API Calls** → Attach token via interceptor
3. **Token Expiry** → Auto-refresh using refresh endpoint
4. **Refresh Failure** → Auto-logout and redirect

## 🎯 Key Features

### Smart Error Handling
- **Network errors** → User-friendly messages
- **Validation errors** → Field-specific feedback
- **Auth errors** → Automatic token refresh
- **Server errors** → Graceful degradation

### Loading States
- **Button spinners** during form submission
- **Page loaders** for data fetching
- **Skeleton screens** for better UX
- **Disabled states** to prevent double-submission

### Form Validation
- **Email format** validation
- **Password strength** requirements
- **Confirm password** matching
- **Real-time feedback** as user types

## 🔄 State Management

### AuthContext
```javascript
{
  user: null | UserObject,
  isAuthenticated: boolean,
  loading: boolean,
  error: string | null,
  login: (credentials) => Promise,
  signup: (userData) => Promise,
  logout: () => Promise,
  fetchMe: () => Promise,
  updateUser: (data) => void
}
```

### Toast System
```javascript
{
  success: (message, duration?) => void,
  error: (message, duration?) => void,
  warning: (message, duration?) => void,
  info: (message, duration?) => void
}
```

## 🛡️ Security Best Practices

- ✅ **No sensitive data** in localStorage
- ✅ **HTTPS-only** in production
- ✅ **CSRF protection** via SameSite cookies
- ✅ **XSS prevention** via proper escaping
- ✅ **Input validation** on all forms
- ✅ **Secure headers** in production build

## 📱 Mobile Support

- **Responsive sidebar** → Drawer on mobile
- **Touch gestures** → Swipe to close drawer
- **Viewport optimization** → Proper scaling
- **Performance** → Lazy loading & code splitting

## 🎨 Theme System

- **Light/Dark modes** with system preference
- **Persistent theme** across sessions
- **Smooth transitions** between themes
- **Accessible contrast** ratios

## 🚨 Error Boundaries

- **Component-level** error catching
- **Graceful fallbacks** for broken components
- **Error reporting** for debugging
- **User-friendly** error messages

This frontend provides a complete, production-ready integration with the SmartBite backend, following modern React best practices and security standards.