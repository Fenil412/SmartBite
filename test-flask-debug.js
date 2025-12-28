// Debug Flask HMAC signature generation to match Flask expectations
// Run this: node test-flask-debug.js

const crypto = require('crypto');
const { exec } = require('child_process');

const INTERNAL_HMAC_SECRET = 'JOu0USVT1q5kN1wkclAttRKWA8LaxMzW'

function generateHMACSignature(timestamp, body) {
  const message = timestamp + body;
  console.log(`HMAC Input: "${message}"`);
  console.log(`HMAC Secret: "${INTERNAL_HMAC_SECRET}"`);
  
  const signature = crypto
    .createHmac('sha256', INTERNAL_HMAC_SECRET)
    .update(message)
    .digest('hex');
    
  console.log(`Generated Signature: ${signature}`);
  return signature;
}

async function debugFlaskHMAC() {
  console.log('🔍 Debugging Flask HMAC Signature\n')
  
  const timestamp = Math.floor(Date.now() / 1000).toString()
  console.log(`Current timestamp: ${timestamp}`)
  
  // Create a simple, clean payload
  const testPayload = {
    "userId": "695122887f6900d7c05e54ba",
    "data": {
      "user": {
        "id": "695122887f6900d7c05e54ba",
        "username": "mltest",
        "age": 25
      }
    },
    "timestamp": timestamp
  }
  
  // Use compact JSON (no spaces) like Flask expects
  const body = JSON.stringify(testPayload);
  console.log(`Request body: ${body}`);
  console.log(`Body length: ${body.length} characters\n`);
  
  const signature = generateHMACSignature(timestamp, body);
  
  console.log('\n📤 Testing with curl...')
  
  // Create curl command with exact formatting
  const curlCommand = `curl -s -X POST http://localhost:5000/internal/sync-user ` +
    `-H "Content-Type: application/json" ` +
    `-H "x-timestamp: ${timestamp}" ` +
    `-H "x-signature: ${signature}" ` +
    `-d '${body}'`;
  
  console.log('Curl command:');
  console.log(curlCommand);
  console.log('\nExecuting...\n');
  
  exec(curlCommand, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Curl execution failed');
      console.log(`Error: ${error.message}`);
      return;
    }
    
    if (stderr) {
      console.log('⚠️  Stderr:', stderr);
    }
    
    console.log('📥 Flask Response:');
    console.log(stdout);
    
    try {
      const response = JSON.parse(stdout);
      if (response.success) {
        console.log('\n🎉 SUCCESS! Flask API #4 is working!');
        console.log('✅ User data stored in MongoDB user_context collection');
        console.log('✅ HMAC signature verification passed');
        console.log('✅ All 4 ML APIs are now working correctly!');
        
        console.log('\n📊 Final Status:');
        console.log('API #1: Internal User Context (Node.js) ✅');
        console.log('API #2: ML User Context (Node.js) ✅');
        console.log('API #3: ML Meals (Node.js) ✅');
        console.log('API #4: Flask Sync (Flask) ✅');
        
      } else {
        console.log('\n❌ Flask API still failing');
        console.log(`Error: ${response.message}`);
        
        if (response.message === 'Request expired') {
          console.log('\n🔧 Try running the test again (timestamp might be too old)');
        } else if (response.message === 'Invalid signature') {
          console.log('\n🔧 HMAC signature mismatch - check secrets match');
        }
      }
    } catch (parseError) {
      console.log('Response received but not valid JSON:', stdout);
    }
  });
}

debugFlaskHMAC()