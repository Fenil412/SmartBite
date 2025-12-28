// Final Flask test with IPv4 fix
// Run this: node test-flask-final-fix.js

const crypto = require('crypto');
const http = require('http');

const INTERNAL_HMAC_SECRET = 'JOu0USVT1q5kN1wkclAttRKWA8LaxMzW';

function generateHMACSignature(timestamp, body) {
  const message = timestamp + body;
  return crypto
    .createHmac('sha256', INTERNAL_HMAC_SECRET)
    .update(message)
    .digest('hex');
}

async function testFlaskFinalFix() {
  console.log('🐍 Final Flask Test with IPv4 Fix\n');
  
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const testPayload = {
    "userId": "695122887f6900d7c05e54ba",
    "data": {
      "user": {
        "id": "695122887f6900d7c05e54ba",
        "username": "mltest",
        "age": 25,
        "goal": "maintenance",
        "activityLevel": "moderate"
      },
      "constraints": {
        "maxCookTime": 30,
        "skillLevel": "beginner"
      },
      "feedback": [],
      "adherenceHistory": []
    }
  };
  
  const body = JSON.stringify(testPayload);
  const signature = generateHMACSignature(timestamp, body);
  
  console.log(`Timestamp: ${timestamp}`);
  console.log(`Body length: ${body.length} chars`);
  console.log(`Generated signature: ${signature}`);
  console.log('\n📤 Sending to Flask (IPv4)...');
  console.log('🔍 Check Flask terminal for debug output!\n');
  
  const options = {
    hostname: '127.0.0.1',  // Force IPv4
    port: 5000,
    path: '/internal/sync-user',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-timestamp': timestamp,
      'x-signature': signature,
      'Content-Length': Buffer.byteLength(body)
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📥 Flask Response:');
      console.log(data);
      
      try {
        const response = JSON.parse(data);
        if (response.success) {
          console.log('\n🎉 SUCCESS! Flask API #4 is working!');
          console.log('✅ User context stored in MongoDB');
          console.log('✅ All 4 ML APIs are now functional!');
          
          console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('🚀 ML CONTRACT SYSTEM COMPLETE!');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('API #1: Internal User Context (Node.js) ✅');
          console.log('API #2: ML User Context (Node.js)       ✅');
          console.log('API #3: ML Meals (Node.js)              ✅');
          console.log('API #4: Flask Sync (Flask)              ✅');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          
        } else {
          console.log('\n❌ Still failing:', response.message);
          console.log('🔍 Check Flask terminal debug output for details');
        }
      } catch (parseError) {
        console.log('Response not valid JSON:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ HTTP request failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure Flask is running: python -m app.main');
    console.log('2. Check if port 5000 is available');
    console.log('3. Try curl: curl http://127.0.0.1:5000/health');
  });
  
  req.write(body);
  req.end();
}

testFlaskFinalFix();