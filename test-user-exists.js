// Test to check if we have any users in the database
// Run this after starting the server: node test-user-exists.js

const API_BASE = 'http://localhost:8000/api/v1'

async function testUserExists() {
  console.log('🔍 Checking if users exist in database...\n')
  
  try {
    // Try to login with any credentials to see what happens
    const loginResponse = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    })
    
    const loginResult = await loginResponse.json()
    
    if (loginResponse.status === 404) {
      console.log('❌ No users found in database')
      console.log('📝 You need to create a user account first:')
      console.log('1. Go to http://localhost:5174')
      console.log('2. Sign up for a new account')
      console.log('3. Then test the ML APIs with your credentials')
    } else if (loginResponse.status === 401) {
      console.log('✅ Users exist in database (wrong credentials)')
      console.log('📝 To test ML APIs:')
      console.log('1. Use your actual login credentials')
      console.log('2. Or create a new account at http://localhost:5174')
    } else if (loginResponse.status === 200) {
      console.log('✅ Login successful!')
      console.log(`User ID: ${loginResult.data?.user?._id}`)
      console.log('📝 You can now test the ML APIs with this user')
    } else {
      console.log(`Unexpected response: ${loginResponse.status}`)
      console.log(loginResult)
    }

    // Test with a dummy user ID to see the internal endpoint behavior
    console.log('\n🔍 Testing internal endpoint with dummy user ID...')
    
    const internalKey = 'SmartBite_Internal_2024_SecureKey_ML_Contract_System_v1'
    const dummyUserId = '507f1f77bcf86cd799439011' // Valid ObjectId format
    
    const internalResponse = await fetch(`${API_BASE}/users/internal/ai/user-context/${dummyUserId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': internalKey
      }
    })
    
    console.log(`Internal endpoint status: ${internalResponse.status}`)
    
    if (internalResponse.status === 404) {
      console.log('✅ Internal endpoint working (user not found - expected)')
    } else if (internalResponse.status === 500) {
      const errorData = await internalResponse.json()
      console.log('❌ Internal endpoint error:', errorData.message)
    } else {
      const responseData = await internalResponse.json()
      console.log('Response:', responseData)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n🔧 Make sure the server is running: cd server && npm run dev')
  }
}

testUserExists()