// Simple test script to check all 4 ML APIs
// Run this after starting the server: node test-ml-apis-simple.js

const API_BASE = 'http://localhost:8000/api/v1'
const INTERNAL_API_BASE = 'http://localhost:8000/api'

async function testAllMLAPIs() {
  console.log('🧪 Testing All 4 ML APIs...\n')
  
  // These values will be filled in during the test
  let authToken = ''
  let userId = ''
  const internalKey = 'SmartBite_Internal_2024_SecureKey_ML_Contract_System_v1'

  try {
    console.log('🔐 Step 1: Login to get authentication token...')
    
    // You'll need to replace these with your actual login credentials
    const loginData = {
      email: 'YOUR_EMAIL_HERE',  // Replace with your email
      password: 'YOUR_PASSWORD_HERE'  // Replace with your password
    }
    
    const loginResponse = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    })
    
    if (loginResponse.ok) {
      const loginResult = await loginResponse.json()
      authToken = loginResult.data.accessToken
      userId = loginResult.data.user._id
      console.log('✅ Login successful!')
      console.log(`   User ID: ${userId}`)
      console.log(`   Token: ${authToken.substring(0, 20)}...`)
    } else {
      console.log('❌ Login failed - please update your credentials in the script')
      console.log('   Update loginData with your actual email and password')
      return
    }

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }

    const internalHeaders = {
      'Content-Type': 'application/json',
      'x-internal-key': internalKey
    }

    console.log('\n🔍 Step 2: Testing API #1 - Internal User Context...')
    
    const userContextResponse = await fetch(`${API_BASE}/users/internal/ai/user-context/${userId}`, {
      headers: internalHeaders
    })
    
    if (userContextResponse.ok) {
      const userData = await userContextResponse.json()
      console.log('✅ API #1 - Internal User Context: WORKING')
      console.log(`   User ID: ${userData.data?.user?.id}`)
      console.log(`   Constraints: ${Object.keys(userData.data?.constraints || {}).length} fields`)
      console.log(`   Feedback: ${userData.data?.feedback?.length || 0} entries`)
      console.log(`   Adherence History: ${userData.data?.adherenceHistory?.length || 0} entries`)
      console.log(`   Synced to Flask: ${userData.syncedToFlask ? 'Yes' : 'No'}`)
    } else {
      console.log('❌ API #1 - Internal User Context: FAILED')
      console.log(`   Status: ${userContextResponse.status}`)
      const errorText = await userContextResponse.text()
      console.log(`   Error: ${errorText}`)
    }

    console.log('\n🤖 Step 3: Testing API #2 - ML User Context...')
    
    const mlUserResponse = await fetch(`${INTERNAL_API_BASE}/ml/user-context`, {
      headers: authHeaders
    })
    
    if (mlUserResponse.ok) {
      const mlUserData = await mlUserResponse.json()
      console.log('✅ API #2 - ML User Context: WORKING')
      console.log(`   User ID: ${mlUserData.data?.user?.id}`)
      console.log(`   Age: ${mlUserData.data?.user?.age || 'Not set'}`)
      console.log(`   Activity Level: ${mlUserData.data?.user?.activityLevel || 'Not set'}`)
      console.log(`   Dietary Preferences: ${mlUserData.data?.user?.dietaryPreferences?.length || 0}`)
      console.log(`   Budget Tier: ${mlUserData.data?.user?.budgetTier || 'Not set'}`)
    } else {
      console.log('❌ API #2 - ML User Context: FAILED')
      console.log(`   Status: ${mlUserResponse.status}`)
    }

    console.log('\n🍽️ Step 4: Testing API #3 - ML Meal Catalog...')
    
    const mlMealsResponse = await fetch(`${INTERNAL_API_BASE}/ml/meals`, {
      headers: authHeaders
    })
    
    if (mlMealsResponse.ok) {
      const mlMealsData = await mlMealsResponse.json()
      console.log('✅ API #3 - ML Meal Catalog: WORKING')
      console.log(`   Total meals: ${mlMealsData.count}`)
      
      if (mlMealsData.data?.[0]) {
        const sampleMeal = mlMealsData.data[0]
        console.log(`   Sample meal: ${sampleMeal.name}`)
        console.log(`   Cuisine: ${sampleMeal.cuisine}`)
        console.log(`   Calories: ${sampleMeal.nutrition?.calories}`)
        console.log(`   Cook Time: ${sampleMeal.cookTime} minutes`)
        console.log(`   Embedding Vector: ${sampleMeal.embedding?.length || 0} dimensions`)
      } else {
        console.log('   No meals found in database')
      }
    } else {
      console.log('❌ API #3 - ML Meal Catalog: FAILED')
      console.log(`   Status: ${mlMealsResponse.status}`)
    }

    console.log('\n📊 Step 5: Testing API #4 - ML Meal Stats...')
    
    const mlStatsResponse = await fetch(`${INTERNAL_API_BASE}/ml/meals/stats`, {
      headers: authHeaders
    })
    
    if (mlStatsResponse.ok) {
      const mlStatsData = await mlStatsResponse.json()
      console.log('✅ API #4 - ML Meal Stats: WORKING')
      console.log(`   Total meals: ${mlStatsData.data?.totalMeals}`)
      console.log(`   Cuisine types: ${mlStatsData.data?.cuisineDistribution?.length || 0}`)
      console.log(`   Meal types: ${mlStatsData.data?.mealTypeDistribution?.length || 0}`)
      console.log(`   Skill levels: ${mlStatsData.data?.skillLevelDistribution?.length || 0}`)
      
      if (mlStatsData.data?.cuisineDistribution?.length > 0) {
        console.log(`   Top cuisine: ${mlStatsData.data.cuisineDistribution[0]._id} (${mlStatsData.data.cuisineDistribution[0].count} meals)`)
      }
    } else {
      console.log('❌ API #4 - ML Meal Stats: FAILED')
      console.log(`   Status: ${mlStatsResponse.status}`)
    }

    console.log('\n🔒 Step 6: Testing Security (Invalid Internal Key)...')
    
    const invalidKeyResponse = await fetch(`${API_BASE}/users/internal/ai/user-context/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': 'invalid-key'
      }
    })
    
    if (invalidKeyResponse.status === 401) {
      console.log('✅ Security Test: WORKING - Invalid key properly rejected!')
    } else {
      console.log('❌ Security Test: FAILED - Invalid key was accepted!')
    }

    console.log('\n🎉 All ML API Tests Complete!')
    console.log('\n📋 Summary:')
    console.log('API #1: Internal User Context - Builds and syncs user data to Flask')
    console.log('API #2: ML User Context - Provides ML-ready user data')
    console.log('API #3: ML Meal Catalog - Provides meal data for AI training')
    console.log('API #4: ML Meal Stats - Provides catalog statistics')
    console.log('Security: Internal endpoint protection')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n📝 Setup Instructions:')
    console.log('1. Make sure the server is running: cd server && npm run dev')
    console.log('2. Update this script with your login credentials:')
    console.log('   - Replace YOUR_EMAIL_HERE with your actual email')
    console.log('   - Replace YOUR_PASSWORD_HERE with your actual password')
    console.log('3. Run this test: node test-ml-apis-simple.js')
    console.log('\n💡 If you don\'t have an account:')
    console.log('1. Go to http://localhost:5174')
    console.log('2. Sign up for a new account')
    console.log('3. Use those credentials in this script')
  }
}

// Run the test
testAllMLAPIs()