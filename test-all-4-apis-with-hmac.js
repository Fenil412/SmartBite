// Test all 4 ML APIs with proper HMAC signature for Flask
// Run this: node test-all-4-apis-with-hmac.js

const crypto = require('crypto');

const API_BASE = 'http://localhost:8000/api/v1'
const ML_API_BASE = 'http://localhost:8000/api/ml'
const FLASK_BASE = 'http://localhost:5000'

// HMAC secret from server/.env
const INTERNAL_HMAC_SECRET = 'JOu0USVT1q5kN1wkclAttRKWA8LaxMzW'

function generateHMACSignature(timestamp, body) {
  return crypto
    .createHmac('sha256', INTERNAL_HMAC_SECRET)
    .update(timestamp + body)
    .digest('hex');
}

async function testAll4APIs() {
  console.log('🧪 Testing All 4 ML APIs (3 Node.js + 1 Flask)\n')
  
  let authToken = ''
  let userId = ''
  const internalKey = 'SmartBite_Internal_2024_SecureKey_ML_Contract_System_v1'

  try {
    // Step 1: Create/Login user
    console.log('👤 Step 1: Creating test user...')
    
    const testUser = {
      fullName: 'ML API Test User',
      email: 'mlapitest@smartbite.com',
      username: 'mlapitest',
      password: 'Test123!',
      profile: {
        age: 28,
        gender: 'female',
        heightCm: 165,
        weightKg: 60,
        activityLevel: 'active',
        goal: 'fat_loss',
        dietaryPreferences: ['vegan'],
        dietaryRestrictions: ['gluten-free'],
        allergies: ['nuts'],
        medicalNotes: 'Test user for ML API verification'
      },
      preferences: {
        budgetTier: 'high',
        preferredCuisines: ['mediterranean', 'asian'],
        units: 'metric'
      }
    }
    
    const registerResponse = await fetch(`${API_BASE}/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    })
    
    if (registerResponse.status === 201) {
      const registerData = await registerResponse.json()
      authToken = registerData.data.tokens.accessToken
      userId = registerData.data.user._id
      console.log('✅ Test user created successfully!')
      console.log(`   User ID: ${userId}`)
    } else if (registerResponse.status === 409) {
      console.log('👤 User already exists, trying to login...')
      
      const loginResponse = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      })
      
      if (loginResponse.status === 200) {
        const loginData = await loginResponse.json()
        authToken = loginData.data.tokens.accessToken
        userId = loginData.data.user._id
        console.log('✅ Logged in with existing test user!')
        console.log(`   User ID: ${userId}`)
      } else {
        throw new Error('Failed to login with existing user')
      }
    } else {
      const errorData = await registerResponse.json()
      throw new Error(`Registration failed: ${errorData.message}`)
    }

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }

    // Step 2: Test API #1 - ML User Context (Node.js)
    console.log('\n🤖 Step 2: Testing API #1 - ML User Context (Node.js)...')
    console.log(`   URL: ${ML_API_BASE}/user-context`)
    
    const mlUserResponse = await fetch(`${ML_API_BASE}/user-context`, {
      headers: authHeaders
    })
    
    if (mlUserResponse.status === 200) {
      const mlUserData = await mlUserResponse.json()
      console.log('✅ API #1 - ML User Context: WORKING')
      console.log(`   User ID: ${mlUserData.data?.user?.id}`)
      console.log(`   Age: ${mlUserData.data?.user?.age}`)
      console.log(`   Activity Level: ${mlUserData.data?.user?.activityLevel}`)
      console.log(`   Goal: ${mlUserData.data?.user?.goal}`)
      console.log(`   Budget Tier: ${mlUserData.data?.user?.budgetTier}`)
    } else {
      console.log('❌ API #1 - ML User Context: FAILED')
      console.log(`   Status: ${mlUserResponse.status}`)
    }

    // Step 3: Test API #2 - ML Meal Catalog (Node.js)
    console.log('\n🍽️ Step 3: Testing API #2 - ML Meal Catalog (Node.js)...')
    console.log(`   URL: ${ML_API_BASE}/meals`)
    
    const mlMealsResponse = await fetch(`${ML_API_BASE}/meals`, {
      headers: authHeaders
    })
    
    if (mlMealsResponse.status === 200) {
      const mlMealsData = await mlMealsResponse.json()
      console.log('✅ API #2 - ML Meal Catalog: WORKING')
      console.log(`   Total meals: ${mlMealsData.count}`)
      
      if (mlMealsData.data?.[0]) {
        const sampleMeal = mlMealsData.data[0]
        console.log(`   Sample meal: ${sampleMeal.name}`)
        console.log(`   Cuisine: ${sampleMeal.cuisine}`)
        console.log(`   Calories: ${sampleMeal.nutrition?.calories}`)
      }
    } else {
      console.log('❌ API #2 - ML Meal Catalog: FAILED')
      console.log(`   Status: ${mlMealsResponse.status}`)
    }

    // Step 4: Test API #3 - ML Meal Stats (Node.js)
    console.log('\n📊 Step 4: Testing API #3 - ML Meal Stats (Node.js)...')
    console.log(`   URL: ${ML_API_BASE}/meals/stats`)
    
    const mlStatsResponse = await fetch(`${ML_API_BASE}/meals/stats`, {
      headers: authHeaders
    })
    
    if (mlStatsResponse.status === 200) {
      const mlStatsData = await mlStatsResponse.json()
      console.log('✅ API #3 - ML Meal Stats: WORKING')
      console.log(`   Total meals: ${mlStatsData.data?.totalMeals}`)
      console.log(`   Cuisine types: ${mlStatsData.data?.cuisineDistribution?.length || 0}`)
      
      if (mlStatsData.data?.cuisineDistribution?.length > 0) {
        console.log(`   Top cuisine: ${mlStatsData.data.cuisineDistribution[0]._id} (${mlStatsData.data.cuisineDistribution[0].count} meals)`)
      }
    } else {
      console.log('❌ API #3 - ML Meal Stats: FAILED')
      console.log(`   Status: ${mlStatsResponse.status}`)
    }

    // Step 5: Test API #4 - Flask Sync User Context (Flask)
    console.log('\n🐍 Step 5: Testing API #4 - Flask Sync User Context (Flask)...')
    console.log(`   URL: ${FLASK_BASE}/internal/sync-user`)
    
    try {
      // First check if Flask is running
      const flaskHealthResponse = await fetch(`${FLASK_BASE}/health`)
      
      if (flaskHealthResponse.status === 200) {
        console.log('✅ Flask server is running!')
        
        // Generate current timestamp and HMAC signature
        const timestamp = Math.floor(Date.now() / 1000).toString()
        
        const testPayload = {
          userId: userId,
          data: {
            user: {
              id: userId,
              username: testUser.username,
              age: testUser.profile.age,
              goal: testUser.profile.goal,
              activityLevel: testUser.profile.activityLevel,
              dietaryPreferences: testUser.profile.dietaryPreferences
            },
            constraints: {
              maxCookTime: 30,
              skillLevel: 'beginner',
              appliances: ['oven', 'stove'],
              cookingDays: ['monday', 'wednesday', 'friday']
            },
            feedback: [],
            adherenceHistory: []
          },
          timestamp: timestamp
        }
        
        const body = JSON.stringify(testPayload)
        const signature = generateHMACSignature(timestamp, body)
        
        console.log(`   Generated timestamp: ${timestamp}`)
        console.log(`   Generated signature: ${signature.substring(0, 20)}...`)
        
        const flaskSyncResponse = await fetch(`${FLASK_BASE}/internal/sync-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-timestamp': timestamp,
            'x-signature': signature
          },
          body: body
        })
        
        if (flaskSyncResponse.status === 200) {
          const flaskData = await flaskSyncResponse.json()
          console.log('✅ API #4 - Flask Sync User Context: WORKING')
          console.log(`   Success: ${flaskData.success}`)
          console.log(`   Message: ${flaskData.message}`)
          console.log('   📊 User data synced to MongoDB user_context collection!')
        } else {
          console.log('❌ API #4 - Flask Sync User Context: FAILED')
          console.log(`   Status: ${flaskSyncResponse.status}`)
          const errorText = await flaskSyncResponse.text()
          console.log(`   Error: ${errorText}`)
        }
        
      } else {
        console.log('❌ Flask server not responding')
      }
    } catch (flaskError) {
      console.log('❌ Flask server not accessible')
      console.log(`   Error: ${flaskError.message}`)
    }

    console.log('\n🎉 All 4 ML API Tests Complete!')
    console.log('\n📋 Final Summary:')
    console.log('API #1: ML User Context (Node.js) - Provides ML-ready user data')
    console.log('API #2: ML Meal Catalog (Node.js) - Provides meal data for AI training')
    console.log('API #3: ML Meal Stats (Node.js) - Provides catalog statistics')
    console.log('API #4: Flask Sync User Context (Flask) - Stores user data in MongoDB')
    
    console.log('\n📝 Correct API URLs:')
    console.log(`1. ML User Context: ${ML_API_BASE}/user-context`)
    console.log(`2. ML Meal Catalog: ${ML_API_BASE}/meals`)
    console.log(`3. ML Meal Stats: ${ML_API_BASE}/meals/stats`)
    console.log(`4. Flask Sync: ${FLASK_BASE}/internal/sync-user (with HMAC)`)
    
    console.log('\n💾 Data Storage:')
    console.log('✅ User context data will be stored in MongoDB "user_context" collection')
    console.log(`✅ Look for userId: ${userId} in the collection`)

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure Node.js server is running: cd server && npm run dev')
    console.log('2. Make sure Flask server is running: cd Models && venv/Scripts/activate && python -m app.main')
    console.log('3. Check MongoDB connection')
    console.log('4. Verify INTERNAL_HMAC_SECRET matches in both Node.js and Flask')
  }
}

testAll4APIs()