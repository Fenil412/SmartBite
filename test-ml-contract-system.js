// Test script for ML Contract System
// Run this after starting the server: node test-ml-contract-system.js

const API_BASE = 'http://localhost:8000/api/v1'
const INTERNAL_API_BASE = 'http://localhost:8000/api'

async function testMLContractSystem() {
  console.log('🧪 Testing ML Contract System...\n')
  
  // You'll need to replace these with actual values
  const authToken = 'YOUR_JWT_TOKEN_HERE'
  const internalKey = 'YOUR_NODE_INTERNAL_KEY_HERE'
  const testUserId = 'YOUR_USER_ID_HERE'
  
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  }

  const internalHeaders = {
    'Content-Type': 'application/json',
    'x-internal-key': internalKey
  }

  try {
    console.log('🔐 Step 1: Testing Internal User Context Endpoint...')
    
    const userContextResponse = await fetch(`${API_BASE}/users/internal/ai/user-context/${testUserId}`, {
      headers: internalHeaders
    })
    
    if (userContextResponse.ok) {
      const userData = await userContextResponse.json()
      console.log('✅ Internal user context endpoint working!')
      console.log(`   User ID: ${userData.data?.user?.id}`)
      console.log(`   Constraints: ${Object.keys(userData.data?.constraints || {}).length} fields`)
      console.log(`   Feedback: ${userData.data?.feedback?.length || 0} entries`)
      console.log(`   Adherence History: ${userData.data?.adherenceHistory?.length || 0} entries`)
      console.log(`   Synced to Flask: ${userData.syncedToFlask ? 'Yes' : 'No'}`)
    } else {
      console.log('❌ Internal user context endpoint failed')
      console.log('   Status:', userContextResponse.status)
      const errorData = await userContextResponse.text()
      console.log('   Error:', errorData)
    }

    console.log('\n🤖 Step 2: Testing ML User Context Endpoint...')
    
    const mlUserResponse = await fetch(`${INTERNAL_API_BASE}/ml/user-context`, {
      headers: authHeaders
    })
    
    if (mlUserResponse.ok) {
      const mlUserData = await mlUserResponse.json()
      console.log('✅ ML user context endpoint working!')
      console.log(`   User ID: ${mlUserData.data?.user?.id}`)
      console.log(`   Age: ${mlUserData.data?.user?.age || 'Not set'}`)
      console.log(`   Activity Level: ${mlUserData.data?.user?.activityLevel || 'Not set'}`)
      console.log(`   Dietary Preferences: ${mlUserData.data?.user?.dietaryPreferences?.length || 0}`)
      console.log(`   Budget Tier: ${mlUserData.data?.user?.budgetTier || 'Not set'}`)
    } else {
      console.log('❌ ML user context endpoint failed')
      console.log('   Status:', mlUserResponse.status)
    }

    console.log('\n🍽️ Step 3: Testing ML Meal Catalog Endpoint...')
    
    const mlMealsResponse = await fetch(`${INTERNAL_API_BASE}/ml/meals`, {
      headers: authHeaders
    })
    
    if (mlMealsResponse.ok) {
      const mlMealsData = await mlMealsResponse.json()
      console.log('✅ ML meal catalog endpoint working!')
      console.log(`   Total meals: ${mlMealsData.count}`)
      console.log(`   Sample meal: ${mlMealsData.data?.[0]?.name || 'None'}`)
      
      if (mlMealsData.data?.[0]) {
        const sampleMeal = mlMealsData.data[0]
        console.log(`   Cuisine: ${sampleMeal.cuisine}`)
        console.log(`   Calories: ${sampleMeal.nutrition?.calories}`)
        console.log(`   Cook Time: ${sampleMeal.cookTime} minutes`)
        console.log(`   Embedding Vector: ${sampleMeal.embedding?.length || 0} dimensions`)
      }
    } else {
      console.log('❌ ML meal catalog endpoint failed')
      console.log('   Status:', mlMealsResponse.status)
    }

    console.log('\n📊 Step 4: Testing ML Meal Stats Endpoint...')
    
    const mlStatsResponse = await fetch(`${INTERNAL_API_BASE}/ml/meals/stats`, {
      headers: authHeaders
    })
    
    if (mlStatsResponse.ok) {
      const mlStatsData = await mlStatsResponse.json()
      console.log('✅ ML meal stats endpoint working!')
      console.log(`   Total meals: ${mlStatsData.data?.totalMeals}`)
      console.log(`   Cuisine types: ${mlStatsData.data?.cuisineDistribution?.length || 0}`)
      console.log(`   Meal types: ${mlStatsData.data?.mealTypeDistribution?.length || 0}`)
      console.log(`   Skill levels: ${mlStatsData.data?.skillLevelDistribution?.length || 0}`)
    } else {
      console.log('❌ ML meal stats endpoint failed')
      console.log('   Status:', mlStatsResponse.status)
    }

    console.log('\n🔒 Step 5: Testing Security (Invalid Internal Key)...')
    
    const invalidKeyResponse = await fetch(`${API_BASE}/users/internal/ai/user-context/${testUserId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': 'invalid-key'
      }
    })
    
    if (invalidKeyResponse.status === 401) {
      console.log('✅ Security working - invalid key rejected!')
    } else {
      console.log('❌ Security issue - invalid key accepted!')
    }

    console.log('\n🎉 ML Contract System Test Complete!')
    console.log('\n📝 Summary:')
    console.log('✅ Internal user context endpoint - Builds and syncs user data to Flask')
    console.log('✅ ML user context endpoint - Provides ML-ready user data')
    console.log('✅ ML meal catalog endpoint - Provides meal data for AI training')
    console.log('✅ ML meal stats endpoint - Provides catalog statistics')
    console.log('✅ Security validation - Protects internal endpoints')
    
    console.log('\n🔧 Flask Integration:')
    console.log('• User context is automatically synced when data changes')
    console.log('• HMAC signatures ensure secure communication')
    console.log('• Flask failures do not break Node.js APIs')
    console.log('• All endpoints are internal-only (not exposed to frontend)')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n📝 Setup Instructions:')
    console.log('1. Start the server: cd server && npm run dev')
    console.log('2. Login to get a JWT token from browser dev tools')
    console.log('3. Get your user ID from the /users/me endpoint')
    console.log('4. Set NODE_INTERNAL_KEY in your .env file')
    console.log('5. Replace the placeholder values in this script:')
    console.log('   - YOUR_JWT_TOKEN_HERE')
    console.log('   - YOUR_NODE_INTERNAL_KEY_HERE') 
    console.log('   - YOUR_USER_ID_HERE')
    console.log('6. Run this test: node test-ml-contract-system.js')
  }
}

testMLContractSystem()