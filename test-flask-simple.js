// Simple Flask test to match exact format Flask expects
// Run this: node test-flask-simple.js

const crypto = require('crypto');
const { exec } = require('child_process');

const INTERNAL_HMAC_SECRET = 'JOu0USVT1q5kN1wkclAttRKWA8LaxMzW';

function generateHMACSignature(timestamp, body) {
  const message = timestamp + body;
  return crypto
    .createHmac('sha256', INTERNAL_HMAC_SECRET)
    .update(message)
    .digest('hex');
}

async function testFlaskSimple() {
  console.log('🐍 Simple Flask Test\n');
  
  const timestamp = Math.floor(Date.now() / 1000).toString();
  console.log(`Timestamp: ${timestamp}`);
  
  // Use the simplest possible payload
  const testPayload = {
    "userId": "test123",
    "data": {
      "user": {
        "id": "test123",
        "name": "test"
      }
    }
  };
  
  const body = JSON.stringify(testPayload);
  const signature = generateHMACSignature(timestamp, body);
  
  console.log(`Body: ${body}`);
  console.log(`Body length: ${body.length}`);
  console.log(`HMAC input: "${timestamp}${body}"`);
  console.log(`Generated signature: ${signature}`);
  
  console.log('\n📤 Sending to Flask...');
  console.log('🔍 Check your Flask terminal for debug output!\n');
  
  const curlCommand = `curl -s -X POST http://localhost:5000/internal/sync-user ` +
    `-H "Content-Type: application/json" ` +
    `-H "x-timestamp: ${timestamp}" ` +
    `-H "x-signature: ${signature}" ` +
    `-d '${body}'`;
  
  exec(curlCommand, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Curl failed:', error.message);
      return;
    }
    
    console.log('📥 Flask Response:');
    console.log(stdout);
    
    try {
      const response = JSON.parse(stdout);
      if (response.success) {
        console.log('\n🎉 SUCCESS! Flask API is working!');
      } else {
        console.log('\n❌ Still failing:', response.message);
        console.log('\n🔍 Debug Info:');
        console.log('- Check Flask terminal for debug output');
        console.log('- Compare "Expected signature" from Flask with our generated signature');
        console.log('- Check if body format matches exactly');
      }
    } catch (parseError) {
      console.log('Response not JSON:', stdout);
    }
  });
}

testFlaskSimple();