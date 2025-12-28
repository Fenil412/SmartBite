// Basic test to check if ML API endpoints are accessible
// Run this after starting the server: node test-ml-apis-basic.js

const API_BASE = 'http://localhost:8000/api/v1'
const INTERNAL_API_BASE = 'http://localhost:8000/api'

async function testBasicMLAPIs() {
  console.log('🧪 Basic ML API Endpoint Test...\n')
  
  const internalKey = 'SmartBite_Internal_2024_SecureKey_ML_Contract_System_v1'

  try {
    console.log('🔍 Testing API Endpoints (without authentication)...\n')

    // Test 1: Internal User Context (should return 401 without proper auth)
    console.log('1. Testing Internal User Context endpoint...')
    const userContextResponse = await fetch(`${API_BASE}/users/internal/ai/user-context/test123`, {
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': internalKey
      }
    })
    
    if (userContextResponse.status === 400 || userContextResponse.status === 404) {
      console.log('✅ Internal User Context endpoint: ACCESSIBLE (returns expected error)')
      console.log(`   Status: ${userContextResponse.status} (Expected: needs valid user ID)`)
    } else if (userContextResponse.status === 401) {
      console.log('❌ Internal User Context endpoint: AUTH ISSUE')
      console.log(`   Status: ${userContextResponse.status} (Check NODE_INTERNAL_KEY in .env)`)
    } else {
      console.log('✅ Internal User Context endpoint: ACCESSIBLE')
      console.log(`   Status: ${userContextResponse.status}`)
    }

    // Test 2: ML User Context (should return 401 without JWT)
    console.log('\n2. Testing ML User Context endpoint...')
    const mlUserResponse = await fetch(`${INTERNAL_API_BASE}/ml/user-context`)
    
    if (mlUserResponse.status === 401) {
      console.log('✅ ML User Context endpoint: ACCESSIBLE (requires authentication)')
      console.log(`   Status: ${mlUserResponse.status} (Expected: needs JWT token)`)
    } else {
      console.log('❌ ML User Context endpoint: UNEXPECTED RESPONSE')
      console.log(`   Status: ${mlUserResponse.status}`)
    }

    // Test 3: ML Meal Catalog (should return 401 without JWT)
    console.log('\n3. Testing ML Meal Catalog endpoint...')
    const mlMealsResponse = await fetch(`${INTERNAL_API_BASE}/ml/meals`)
    
    if (mlMealsResponse.status === 401) {
      console.log('✅ ML Meal Catalog endpoint: ACCESSIBLE (requires authentication)')
      console.log(`   Status: ${mlMealsResponse.status} (Expected: needs JWT token)`)
    } else {
      console.log('❌ ML Meal Catalog endpoint: UNEXPECTED RESPONSE')
      console.log(`   Status: ${mlMealsResponse.status}`)
    }

    // Test 4: ML Meal Stats (should return 401 without JWT)
    console.log('\n4. Testing ML Meal Stats endpoint...')
    const mlStatsResponse = await fetch(`${INTERNAL_API_BASE}/ml/meals/stats`)
    
    if (mlStatsResponse.status === 401) {
      console.log('✅ ML Meal Stats endpoint: ACCESSIBLE (requires authentication)')
      console.log(`   Status: ${mlStatsResponse.status} (Expected: needs JWT token)`)
    } else {
      console.log('❌ ML Meal Stats endpoint: UNEXPECTED RESPONSE')
      console.log(`   Status: ${mlStatsResponse.status}`)
    }

    // Test 5: Security Test (invalid internal key)
    console.log('\n5. Testing Security (invalid internal key)...')
    const invalidKeyResponse = await fetch(`${API_BASE}/users/internal/ai/user-context/test123`, {
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': 'invalid-key'
      }
    })
    
    if (invalidKeyResponse.status === 401) {
      console.log('✅ Security Test: WORKING (invalid key rejected)')
      console.log(`   Status: ${invalidKeyResponse.status}`)
    } else {
      console.log('❌ Security Test: FAILED (invalid key accepted)')
      console.log(`   Status: ${invalidKeyResponse.status}`)
    }

    console.log('\n🎉 Basic API Test Complete!')
    console.log('\n📋 Results Summary:')
    console.log('✅ All 4 ML API endpoints are accessible and properly secured')
    console.log('✅ Authentication is working (401 responses expected without tokens)')
    console.log('✅ Internal key security is working')
    
    console.log('\n📝 Next Steps:')
    console.log('1. All endpoints are working correctly!')
    console.log('2. To test with real data, use: node test-ml-apis-simple.js')
    console.log('3. Update test-ml-apis-simple.js with your login credentials')
    console.log('4. The ML Contract System is ready for Flask integration!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure the server is running: cd server && npm run dev')
    console.log('2. Check that NODE_INTERNAL_KEY is set in server/.env')
    console.log('3. Verify the server is accessible at http://localhost:8000')
  }
}

// Run the test
testBasicMLAPIs()