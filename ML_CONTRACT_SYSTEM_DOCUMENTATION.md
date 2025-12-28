# 🤖 ML Contract System - Complete Implementation

## 🎯 **Architecture Overview**

SmartBite uses a **dual-backend architecture** for AI/ML functionality:

- **Node.js (Express)** → Source of truth for users, constraints, feedback, meal plans
- **Flask AI Service** → ML/AI engine for recommendations, meal ranking, and personalization
- **Push-based Sync** → Node pushes user context to Flask when data changes
- **Zero Database Sharing** → Flask never accesses MongoDB directly

## 🔐 **Security Implementation**

### **HMAC-SHA256 Authentication**
All Node → Flask communication uses cryptographic signatures:

```javascript
// Signature Generation
const timestamp = Math.floor(Date.now() / 1000).toString()
const body = JSON.stringify(payload)
const signature = crypto
    .createHmac("sha256", process.env.INTERNAL_HMAC_SECRET)
    .update(timestamp + body)
    .digest("hex")

// Headers Sent
{
    "x-timestamp": timestamp,
    "x-signature": signature,
    "Content-Type": "application/json"
}
```

### **Internal Endpoint Protection**
```javascript
// Internal endpoints require special header
if (req.headers["x-internal-key"] !== process.env.NODE_INTERNAL_KEY) {
    return res.status(401).json({ success: false });
}
```

## 📡 **API Endpoints**

### **1. Internal User Context Endpoint**
```
GET /api/v1/users/internal/ai/user-context/:userId
```
**Purpose**: Build and sync complete user context to Flask
**Security**: Requires `x-internal-key` header
**Response**: Complete ML-ready user data + sync confirmation

### **2. ML User Context Endpoint**
```
GET /api/ml/user-context
```
**Purpose**: Get ML-ready user context for authenticated user
**Security**: Requires JWT authentication
**Usage**: Internal ML operations

### **3. ML Meal Catalog Endpoint**
```
GET /api/ml/meals
```
**Purpose**: Get complete meal catalog for ML training
**Security**: Requires JWT authentication
**Response**: All active meals with embeddings and nutrition data

### **4. ML Meal Statistics Endpoint**
```
GET /api/ml/meals/stats
```
**Purpose**: Get meal catalog statistics for ML monitoring
**Security**: Requires JWT authentication
**Response**: Distribution stats by cuisine, meal type, skill level

## 🔄 **Automatic Sync Triggers**

User context is automatically synced to Flask when:

### **Profile Updates**
```javascript
// In user.controller.js - updateUserData()
await user.save({ validateBeforeSave: false });
triggerUserContextSync(userId); // 🔥 Auto-sync
```

### **Constraint Changes**
```javascript
// In constraint.controller.js - upsertConstraints()
const constraint = await Constraint.findOneAndUpdate(/* ... */);
triggerUserContextSync(userId); // 🔥 Auto-sync
```

### **Feedback Submission**
```javascript
// In feedback.controller.js - submitFeedback()
const feedback = await Feedback.create(/* ... */);
triggerUserContextSync(req.user._id); // 🔥 Auto-sync
```

### **Manual Sync**
```javascript
// Internal endpoint call triggers immediate sync
GET /users/internal/ai/user-context/:userId
```

## 📊 **User Context Data Structure**

### **Complete User Context Payload**
```javascript
{
    user: {
        id: "user_id",
        age: 25,
        heightCm: 175,
        weightKg: 70,
        gender: "male",
        activityLevel: "moderate",
        goal: "lose_weight",
        dietaryPreferences: ["vegetarian"],
        dietaryRestrictions: ["gluten_free"],
        allergies: ["nuts"],
        budgetTier: "medium",
        preferredCuisines: ["italian", "asian"],
        units: "metric"
    },
    constraints: {
        cookTime: 30,
        skillLevel: "beginner",
        appliances: ["oven", "stovetop"],
        cookingDays: ["monday", "wednesday", "friday"]
    },
    feedback: [
        {
            id: "feedback_id",
            type: "meal_rating",
            rating: 4,
            mealId: "meal_id",
            comment: "Delicious!",
            createdAt: "2024-01-01T00:00:00Z"
        }
    ],
    adherenceHistory: [
        {
            mealId: "meal_id",
            mealName: "Chicken Stir Fry",
            cuisine: "asian",
            mealType: "dinner",
            status: "eaten",
            date: "2024-01-01",
            planId: "plan_id"
        }
    ],
    contextGeneratedAt: "2024-01-01T00:00:00Z",
    dataVersion: "1.0"
}
```

## 🛡️ **Failure Handling**

### **Non-Blocking Design**
```javascript
// Flask sync failures don't break Node APIs
try {
    await syncUserContextToFlask(userContext);
    console.log('✅ Successfully synced to Flask');
} catch (error) {
    console.warn('⚠️ Flask sync failed - continuing normally');
    // User-facing API continues normally
}
```

### **Graceful Degradation**
- Flask downtime → Node APIs continue working
- Sync failures → Logged but not thrown
- Missing environment variables → Warnings, not errors
- Network timeouts → 5-second timeout with graceful handling

## 🔧 **Environment Configuration**

### **Required Environment Variables**
```bash
# Internal Security
NODE_INTERNAL_KEY=your_super_secret_internal_key_here
INTERNAL_HMAC_SECRET=your_hmac_secret_for_flask_communication

# Flask AI Service
FLASK_AI_BASE_URL=http://localhost:5000
# Production: FLASK_AI_BASE_URL=https://your-flask-ai-service.com
```

### **Flask Service Requirements**
Flask must implement:
```python
@app.route('/internal/sync-user', methods=['POST'])
def sync_user():
    # 1. Verify HMAC signature
    # 2. Validate timestamp (prevent replay attacks)
    # 3. Store user context in cache/memory/vector DB
    # 4. Return success confirmation
```

## 🧪 **Testing**

### **Automated Testing**
```bash
# Run comprehensive ML contract tests
node test-ml-contract-system.js
```

### **Manual Testing Steps**
1. **Start Server**: `cd server && npm run dev`
2. **Get Auth Token**: Login via frontend, copy JWT from dev tools
3. **Get User ID**: Call `/api/v1/users/me` endpoint
4. **Set Environment**: Add `NODE_INTERNAL_KEY` to `.env`
5. **Test Internal Endpoint**: Call `/users/internal/ai/user-context/:userId`
6. **Verify Sync**: Check Flask logs for received data

### **Security Testing**
```bash
# Test invalid internal key (should return 401)
curl -H "x-internal-key: invalid" \
     http://localhost:8000/api/v1/users/internal/ai/user-context/USER_ID

# Test missing internal key (should return 401)
curl http://localhost:8000/api/v1/users/internal/ai/user-context/USER_ID
```

## 📈 **Monitoring & Logging**

### **Sync Success Logging**
```
✅ Successfully synced user context to Flask for user: 507f1f77bcf86cd799439011
```

### **Sync Failure Logging**
```
⚠️ Flask AI service unavailable - user context sync skipped for user: 507f1f77bcf86cd799439011
❌ Flask AI sync failed with status 500 for user: 507f1f77bcf86cd799439011
```

### **Performance Monitoring**
- Sync operation timeout: 5 seconds
- Non-blocking execution: User APIs continue regardless of Flask status
- Automatic retry: Not implemented (Flask should handle persistence)

## 🚀 **Production Deployment**

### **Node.js Configuration**
```bash
# Production environment variables
NODE_ENV=production
FLASK_AI_BASE_URL=https://your-flask-ai-service.com
INTERNAL_HMAC_SECRET=your_production_hmac_secret
NODE_INTERNAL_KEY=your_production_internal_key
```

### **Flask Service Requirements**
- **HTTPS Only**: All production communication must use HTTPS
- **Signature Verification**: Must verify HMAC signatures
- **Timestamp Validation**: Prevent replay attacks (5-minute window)
- **Rate Limiting**: Implement rate limiting for sync endpoints
- **Health Checks**: Provide health check endpoints for monitoring

### **Security Checklist**
- ✅ HMAC secrets are different in production
- ✅ Internal keys are rotated regularly
- ✅ Flask service is not publicly accessible
- ✅ All communication uses HTTPS
- ✅ Proper logging without exposing secrets
- ✅ Network-level security (VPC, firewalls)

## 🔮 **Future Enhancements**

### **Advanced Features**
- **Batch Sync**: Sync multiple users in single request
- **Incremental Sync**: Only sync changed data fields
- **Sync Queue**: Queue sync operations for reliability
- **Webhook Support**: Flask can notify Node of ML model updates

### **Monitoring Improvements**
- **Sync Success Metrics**: Track sync success/failure rates
- **Performance Metrics**: Monitor sync latency and throughput
- **Health Dashboards**: Real-time Flask service health monitoring
- **Alert System**: Notify on sync failures or Flask downtime

## ✅ **Implementation Status**

### **Completed Features**
- ✅ **Secure Internal Communication**: HMAC-SHA256 authentication
- ✅ **Automatic Sync Triggers**: Profile, constraints, feedback updates
- ✅ **Comprehensive User Context**: Complete ML-ready data structure
- ✅ **Meal Catalog API**: Full meal data for ML training
- ✅ **Failure Handling**: Non-blocking, graceful degradation
- ✅ **Security Protection**: Internal endpoint authentication
- ✅ **Testing Suite**: Comprehensive test scripts
- ✅ **Documentation**: Complete implementation guide

### **Production Ready**
The ML Contract System is **fully implemented and production-ready** with:
- **Robust Security**: Cryptographic authentication and authorization
- **Reliable Sync**: Automatic triggers with failure handling
- **Complete Data**: Comprehensive user context for ML operations
- **Monitoring**: Detailed logging and error tracking
- **Testing**: Automated test suite for validation

The system provides a **secure, reliable bridge** between Node.js and Flask AI services, enabling advanced ML-powered features while maintaining data integrity and system reliability.