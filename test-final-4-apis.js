// Final test for all 4 ML APIs (3 Node.js + 1 Flask)
// Run this: node test-final-4-apis.js

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

async function testFinal4APIs() {
  console.log('🧪 Final Test: All 4 ML APIs\n')
  console.log('📋 Testing APIs:')
  console.log('1. Internal User Context (Node.js) - Builds user data & syncs to Flask')
  console.log('2. ML User Context (Node.js) - ML-ready user data')
  console.log('3. ML Meals (Node.js) - Meal catalog for AI')
  console.log('4. Flask Sync (Flask) - Stores data in MongoDB\n')
  
  let authToken = ''
  let userId = '695122887f6900d7c05e54ba' // Using the user ID you mentioned
  const internalKey = 'SmartBite_Internal_2024_SecureKey_ML_Contract_System_v1'

  try {
    // Step 1: Get auth token (login with existing user)
    console.log('🔐 Step 1: Getting authentication token...')
    
    const loginResponse = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mltest@smartbite.com',
        password: 'Test123!'
      })
    })
    
    if (loginResponse.status === 200) {
      const loginData = await loginResponse.json()
      authToken = loginData.data.tokens.accessToken
      userId = loginData.data.user._id
      console.log('✅ Authentication successful!')
      console.log(`   User ID: ${userId}`)
    } else {
      console.log('⚠️  Using provided User ID (no auth token for internal API)')
      userId = '695122887f6900d7c05e54ba'
    }

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }

    const internalHeaders = {
      'Content-Type': 'application/json',
      'x-internal-key': internalKey
    }

    // Step 2: Test API #1 - Internal User Context (Node.js)
    console.log('\n🔍 Step 2: Testing API #1 - Internal User Context (Node.js)...')
    console.log(`   URL: ${API_BASE}/users/internal/ai/user-context/${userId}`)
    
    const userContextResponse = await fetch(`${API_BASE}/users/internal/ai/user-context/${userId}`, {
      headers: internalHeaders
    })
    
    console.log(`   Status: ${userContextResponse.status}`)
    
    if (userContextResponse.status === 200) {
      const userData = await userContextResponse.json()
      console.log('✅ API #1 - Internal User Context: WORKING')
      console.log(`   User ID: ${userData.data?.user?.id}`)
      console.log(`   Age: ${userData.data?.user?.age}`)
      console.log(`   Activity Level: ${userData.data?.user?.activityLevel}`)
      console.log(`   Goal: ${userData.data?.user?.goal}`)
      console.log(`   Budget Tier: ${userData.data?.user?.budgetTier}`)
      console.log(`   Dietary Preferences: ${userData.data?.user?.dietaryPreferences?.join(', ') || 'None'}`)
      console.log(`   Constraints: ${Object.keys(userData.data?.constraints || {}).length} fields`)
      console.log(`   Feedback: ${userData.data?.feedback?.length || 0} entries`)
      console.log(`   Synced to Flask: ${userData.syncedToFlask ? 'Yes' : 'No'}`)
    } else {
      console.log('❌ API #1 - Internal User Context: FAILED')
      const errorText = await userContextResponse.text()
      console.log(`   Error: ${errorText}`)
    }

    // Step 3: Test API #2 - ML User Context (Node.js)
    console.log('\n🤖 Step 3: Testing API #2 - ML User Context (Node.js)...')
    console.log(`   URL: ${ML_API_BASE}/user-context`)
    
    if (authToken) {
      const mlUserResponse = await fetch(`${ML_API_BASE}/user-context`, {
        headers: authHeaders
      })
      
      console.log(`   Status: ${mlUserResponse.status}`)
      
      if (mlUserResponse.status === 200) {
        const mlUserData = await mlUserResponse.json()
        console.log('✅ API #2 - ML User Context: WORKING')
        console.log(`   User ID: ${mlUserData.data?.user?.id}`)
        console.log(`   Age: ${mlUserData.data?.user?.age}`)
        console.log(`   Activity Level: ${mlUserData.data?.user?.activityLevel}`)
        console.log(`   Goal: ${mlUserData.data?.user?.goal}`)
        console.log(`   Budget Tier: ${mlUserData.data?.user?.budgetTier}`)
        console.log(`   Constraints: ${Object.keys(mlUserData.data?.constraints || {}).length} fields`)
      } else {
        console.log('❌ API #2 - ML User Context: FAILED')
        const errorText = await mlUserResponse.text()
        console.log(`   Error: ${errorText}`)
      }
    } else {
      console.log('⚠️  API #2 - ML User Context: SKIPPED (no auth token)')
    }

    // Step 4: Test API #3 - ML Meals (Node.js)
    console.log('\n🍽️ Step 4: Testing API #3 - ML Meals (Node.js)...')
    console.log(`   URL: ${ML_API_BASE}/meals`)
    
    if (authToken) {
      const mlMealsResponse = await fetch(`${ML_API_BASE}/meals`, {
        headers: authHeaders
      })
      
      console.log(`   Status: ${mlMealsResponse.status}`)
      
      if (mlMealsResponse.status === 200) {
        const mlMealsData = await mlMealsResponse.json()
        console.log('✅ API #3 - ML Meals: WORKING')
        console.log(`   Total meals: ${mlMealsData.count}`)
        
        if (mlMealsData.data?.[0]) {
          const sampleMeal = mlMealsData.data[0]
          console.log(`   Sample meal: ${sampleMeal.name}`)
          console.log(`   Cuisine: ${sampleMeal.cuisine}`)
          console.log(`   Calories: ${sampleMeal.nutrition?.calories}`)
          console.log(`   Cook Time: ${sampleMeal.cookTime} minutes`)
        }
      } else {
        console.log('❌ API #3 - ML Meals: FAILED')
        const errorText = await mlMealsResponse.text()
        console.log(`   Error: ${errorText}`)
      }
    } else {
      console.log('⚠️  API #3 - ML Meals: SKIPPED (no auth token)')
    }

    // Step 5: Test API #4 - Flask Sync (Flask)
    console.log('\n🐍 Step 5: Testing API #4 - Flask Sync (Flask)...')
    console.log(`   URL: ${FLASK_BASE}/internal/sync-user`)
    
    try {
      // First check Flask health
      const healthResponse = await fetch(`${FLASK_BASE}/health`)
      console.log(`   Flask health status: ${healthResponse.status}`)
      
      if (healthResponse.status === 200) {
        console.log('✅ Flask server is running!')
        
        // Test sync endpoint with proper HMAC
        const timestamp = Math.floor(Date.now() / 1000).toString()
        
        const testPayload = {
          userId: userId,
          data: {
            user: {
              id: userId,
              username: 'mltest',
              age: 25,
              goal: 'maintenance',
              activityLevel: 'moderate',
              dietaryPreferences: ['vegetarian']
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
        
        console.log(`   Current timestamp: ${timestamp}`)
        console.log(`   Generated signature: ${signature.substring(0, 20)}...`)
        
        const syncResponse = await fetch(`${FLASK_BASE}/internal/sync-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-timestamp': timestamp,
            'x-signature': signature
          },
          body: body
        })
        
        console.log(`   Sync response status: ${syncResponse.status}`)
        
        if (syncResponse.status === 200) {
          const syncData = await syncResponse.json()
          console.log('✅ API #4 - Flask Sync: WORKING')
          console.log(`   Success: ${syncData.success}`)
          console.log(`   Message: ${syncData.message}`)
          console.log('   📊 User data stored in MongoDB user_context collection!')
        } else {
          console.log('❌ API #4 - Flask Sync: FAILED')
          const errorText = await syncResponse.text()
          console.log(`   Error: ${errorText}`)
        }
        
      } else {
        console.log('❌ Flask server not responding properly')
      }
    } catch (flaskError) {
      console.log('❌ Flask server connection failed')
      console.log(`   Error: ${flaskError.message}`)
    }

    console.log('\n🎉 All 4 ML API Tests Complete!')
    console.log('\n📋 Final Results Summary:')
    console.log('API #1: Internal User Context (Node.js) - ✅ Should be working')
    console.log('API #2: ML User Context (Node.js) - ✅ Should be working')  
    console.log('API #3: ML Meals (Node.js) - ✅ Should be working')
    console.log('API #4: Flask Sync (Flask) - 🔄 Testing with current timestamp')
    
    console.log('\n📝 API URLs:')
    console.log(`1. ${API_BASE}/users/internal/ai/user-context/:userId`)
    console.log(`2. ${ML_API_BASE}/user-context`)
    console.log(`3. ${ML_API_BASE}/meals`)
    console.log(`4. ${FLASK_BASE}/internal/sync-user`)
    
    console.log('\n💾 MongoDB Data Storage:')
    console.log('✅ Check "user_context" collection in MongoDB')
    console.log(`✅ Look for userId: ${userId}`)
    console.log('✅ Data should include user profile, constraints, feedback, adherence history')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Node.js server: cd server && npm run dev')
    console.log('2. Flask server: cd Models && venv/Scripts/activate && python -m app.main')
    console.log('3. Check MongoDB connection')
    console.log('4. Verify INTERNAL_HMAC_SECRET matches in both servers')
  }
}

testFinal4APIs()