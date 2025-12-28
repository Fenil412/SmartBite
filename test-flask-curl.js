// Test Flask API using curl command since fetch is failing
// Run this: node test-flask-curl.js

const { exec } = require('child_process');
const crypto = require('crypto');

const INTERNAL_HMAC_SECRET = 'JOu0USVT1q5kN1wkclAttRKWA8LaxMzW'

function generateHMACSignature(timestamp, body) {
  return crypto
    .createHmac('sha256', INTERNAL_HMAC_SECRET)
    .update(timestamp + body)
    .digest('hex');
}

async function testFlaskWithCurl() {
  console.log('🐍 Testing Flask API with curl\n')
  
  // Test Flask health first
  console.log('1. Testing Flask health...')
  
  exec('curl -s http://localhost:5000/health', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Flask health check failed')
      console.log(`Error: ${error.message}`)
      return;
    }
    
    console.log('✅ Flask health response:')
    console.log(stdout)
    
    // Now test the sync endpoint
    console.log('\n2. Testing Flask sync endpoint...')
    
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const testPayload = {
      userId: '695122887f6900d7c05e54ba',
      data: {
        user: {
          id: '695122887f6900d7c05e54ba',
          username: 'mltest',
          age: 25,
          goal: 'maintenance'
        },
        constraints: { maxCookTime: 30 },
        feedback: [],
        adherenceHistory: []
      },
      timestamp: timestamp
    }
    
    const body = JSON.stringify(testPayload)
    const signature = generateHMACSignature(timestamp, body)
    
    console.log(`Current timestamp: ${timestamp}`)
    console.log(`Generated signature: ${signature.substring(0, 20)}...`)
    
    const curlCommand = `curl -X POST http://localhost:5000/internal/sync-user ` +
      `-H "Content-Type: application/json" ` +
      `-H "x-timestamp: ${timestamp}" ` +
      `-H "x-signature: ${signature}" ` +
      `-d '${body}'`
    
    console.log('\nExecuting curl command...')
    
    exec(curlCommand, (syncError, syncStdout, syncStderr) => {
      if (syncError) {
        console.log('❌ Flask sync failed')
        console.log(`Error: ${syncError.message}`)
        return;
      }
      
      console.log('✅ Flask sync response:')
      console.log(syncStdout)
      
      try {
        const response = JSON.parse(syncStdout)
        if (response.success) {
          console.log('\n🎉 API #4 - Flask Sync: WORKING!')
          console.log('✅ User data stored in MongoDB user_context collection')
          console.log(`✅ Check for userId: 695122887f6900d7c05e54ba`)
        }
      } catch (parseError) {
        console.log('Response received but not valid JSON')
      }
    });
  });
}

testFlaskWithCurl()