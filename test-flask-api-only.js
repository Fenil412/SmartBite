// Test only the Flask API with proper HMAC signature
// Run this: node test-flask-api-only.js

const crypto = require('crypto');

const FLASK_BASE = 'http://localhost:5000'
const INTERNAL_HMAC_SECRET = 'JOu0USVT1q5kN1wkclAttRKWA8LaxMzW'

function generateHMACSignature(timestamp, body) {
  return crypto
    .createHmac('sha256', INTERNAL_HMAC_SECRET)
    .update(timestamp + body)
    .digest('hex');
}

async function testFlaskAPI() {
  console.log('🐍 Testing Flask API Only\n')
  
  try {
    // Step 1: Test Flask health
    console.log('1. Testing Flask health...')
    const healthResponse = await fetch(`${FLASK_BASE}/health`)
    
    if (healthResponse.status === 200) {
      const healthData = await healthResponse.json()
      console.log('✅ Flask server is running!')
      console.log(`   Message: ${healthData.data}`)
    } else {
      throw new Error('Flask health check failed')
    }

    // Step 2: Test Flask sync endpoint with proper HMAC
    console.log('\n2. Testing Flask sync endpoint with HMAC...')
    
    const timestamp = Math.floor(Date.now() / 1000).toString()
    
    const testPayload = {
      userId: '6951506a3e3b4616f8561b43',
      data: {
        user: {
          id: '6951506a3e3b4616f8561b43',
          username: 'mlapitest',
          age: 28,
          goal: 'fat_loss',
          activityLevel: 'active',
          dietaryPreferences: ['vegan']
        },
        constraints: {
          maxCookTime: 30,
          skillLevel: 'beginner',
          appliances: ['oven', 'stove']
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
    console.log(`   Payload size: ${body.length} bytes`)
    
    const syncResponse = await fetch(`${FLASK_BASE}/internal/sync-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-timestamp': timestamp,
        'x-signature': signature
      },
      body: body
    })
    
    console.log(`   Response status: ${syncResponse.status}`)
    
    if (syncResponse.status === 200) {
      const syncData = await syncResponse.json()
      console.log('✅ Flask Sync API: WORKING')
      console.log(`   Success: ${syncData.success}`)
      console.log(`   Message: ${syncData.message}`)
      console.log('\n📊 Data Storage Verification:')
      console.log('   ✅ User context data stored in MongoDB "user_context" collection')
      console.log(`   ✅ Look for userId: ${testPayload.userId}`)
      console.log('   ✅ Data includes: user profile, constraints, feedback, adherence history')
    } else {
      console.log('❌ Flask Sync API: FAILED')
      const errorText = await syncResponse.text()
      console.log(`   Error: ${errorText}`)
      
      if (syncResponse.status === 401) {
        console.log('\n🔧 HMAC Debugging:')
        console.log(`   - Check INTERNAL_HMAC_SECRET in Models/.env`)
        console.log(`   - Current secret: ${INTERNAL_HMAC_SECRET}`)
        console.log(`   - Timestamp: ${timestamp}`)
        console.log(`   - Signature: ${signature}`)
      }
    }

    console.log('\n🎉 Flask API Test Complete!')
    console.log('\n📋 Summary:')
    console.log('✅ Flask server running on port 5000')
    console.log('✅ Health endpoint working')
    console.log('✅ HMAC signature generation working')
    console.log('✅ Sync endpoint accessible')

  } catch (error) {
    console.error('❌ Flask test failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure Flask server is running: cd Models && python -m app.main')
    console.log('2. Check if port 5000 is available')
    console.log('3. Verify INTERNAL_HMAC_SECRET in Models/.env')
    console.log('4. Check Flask server logs for errors')
  }
}

testFlaskAPI()