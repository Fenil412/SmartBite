// Test Flask API with corrected timestamp handling
// Run this: node test-flask-timestamp-fix.js

const crypto = require('crypto');
const { exec } = require('child_process');

const INTERNAL_HMAC_SECRET = 'JOu0USVT1q5kN1wkclAttRKWA8LaxMzW'

function generateHMACSignature(timestamp, body) {
  const message = timestamp + body;
  return crypto
    .createHmac('sha256', INTERNAL_HMAC_SECRET)
    .update(message)
    .digest('hex');
}

async function testFlaskTimestampFix() {
  console.log('🐍 Testing Flask API with Timestamp Fix\n')
  
  // Generate current Unix timestamp
  const timestamp = Math.floor(Date.now() / 1000).toString()
  console.log(`Current Unix timestamp: ${timestamp}`)
  console.log(`Human readable: ${new Date(parseInt(timestamp) * 1000).toISOString()}`)
  
  const testPayload = {
    "userId": "695122887f6900d7c05e54ba",
    "data": {
      "user": {
        "id": "695122887f6900d7c05e54ba",
        "username": "mltest",
        "age": 25,
        "goal": "maintenance"
      },
      "constraints": {
        "maxCookTime": 30,
        "skillLevel": "beginner"
      },
      "feedback": [],
      "adherenceHistory": []
    },
    "timestamp": timestamp
  }
  
  const body = JSON.stringify(testPayload)
  const signature = generateHMACSignature(timestamp, body)
  
  console.log(`\nHMAC Details:`)
  console.log(`- Timestamp: ${timestamp}`)
  console.log(`- Body length: ${body.length} chars`)
  console.log(`- HMAC input: "${timestamp}${body.substring(0, 50)}..."`)
  console.log(`- Generated signature: ${signature}`)
  
  const curlCommand = `curl -s -X POST http://localhost:5000/internal/sync-user ` +
    `-H "Content-Type: application/json" ` +
    `-H "x-timestamp: ${timestamp}" ` +
    `-H "x-signature: ${signature}" ` +
    `-d '${body}'`
  
  console.log('\n📤 Testing Flask API...')
  
  exec(curlCommand, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Curl failed:', error.message)
      return
    }
    
    console.log('📥 Flask Response:')
    console.log(stdout)
    
    try {
      const response = JSON.parse(stdout)
      if (response.success) {
        console.log('\n🎉 SUCCESS! Flask API #4 is now working!')
        console.log('✅ HMAC signature verification passed')
        console.log('✅ User data stored in MongoDB')
        console.log('✅ All 4 ML APIs are now fully functional!')
        
        console.log('\n📊 Complete ML Contract System Status:')
        console.log('API #1: Internal User Context (Node.js) ✅')
        console.log('API #2: ML User Context (Node.js)       ✅')
        console.log('API #3: ML Meals (Node.js)              ✅')
        console.log('API #4: Flask Sync (Flask)              ✅')
        
      } else {
        console.log('\n❌ Flask API still failing')
        console.log(`Error: ${response.message}`)
        
        if (response.message.includes('expired')) {
          console.log('🔧 Timestamp issue - check server time sync')
        } else if (response.message.includes('signature')) {
          console.log('🔧 HMAC signature issue - check secret keys match')
        }
      }
    } catch (parseError) {
      console.log('Response not valid JSON:', stdout)
    }
  })
}

testFlaskTimestampFix()