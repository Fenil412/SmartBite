// Simple test for grocery endpoints
// Run this to test if grocery endpoints are working: node test-grocery-endpoints-simple.js

const API_BASE = 'http://localhost:8000/api/v1'

async function testGroceryEndpoints() {
  console.log('🧪 Testing Grocery Endpoints...\n')
  
  try {
    // Test store suggestions (doesn't require auth)
    console.log('1. Testing store suggestions...')
    const storeResponse = await fetch(`${API_BASE}/meal-plans/test123/store-suggestions`)
    
    if (storeResponse.ok) {
      const storeData = await storeResponse.json()
      console.log('✅ Store suggestions endpoint working!')
      console.log(`   Found ${storeData.data?.stores?.length || 0} stores`)
    } else {
      console.log('❌ Store suggestions endpoint failed')
      console.log('   Status:', storeResponse.status)
    }
    
    console.log('\n📝 Note: Other endpoints require authentication.')
    console.log('🌐 Frontend is running at: http://localhost:5174')
    console.log('🔧 Backend is running at: http://localhost:8000')
    console.log('\n💡 To test full functionality:')
    console.log('1. Go to http://localhost:5174')
    console.log('2. Login/signup to get authenticated')
    console.log('3. Create a meal plan with some meals')
    console.log('4. Navigate to Smart Grocery from the sidebar')
    console.log('5. Select your meal plan to see the grocery list')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n🔧 Make sure both servers are running:')
    console.log('   Backend: cd server && npm run dev')
    console.log('   Frontend: cd client && npm run dev')
  }
}

testGroceryEndpoints()