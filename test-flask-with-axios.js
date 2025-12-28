// Test Flask API using axios instead of fetch
// Run this: npm install axios (if not installed) then node test-flask-with-axios.js

const crypto = require('crypto');

const INTERNAL_HMAC_SECRET = 'JOu0USVT1q5kN1wkclAttRKWA8LaxMzW';

function generateHMACSignature(timestamp, body) {
  const message = timestamp + body;
  return crypto
    .createHmac('sha256', INTERNAL_HMAC_SECRET)
    .update(message)
    .digest('hex');
}

async function testFlaskWithAxios() {
  console.log('🐍 Testing Flask with axios\n');
  
  try {
    // Try to import axios
    const axios = require('axios');
    
    const timestamp = Math.floor(Date.now() / 1000).toString();
    console.log(`Timestamp: ${timestamp}`);
    
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
    console.log(`Generated signature: ${signature}`);
    
    console.log('\n📤 Sending to Flask with axios...');
    
    const response = await axios.post('http://localhost:5000/internal/sync-user', testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'x-timestamp': timestamp,
        'x-signature': signature
      },
      timeout: 5000
    });
    
    console.log('✅ Success!', response.data);
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('❌ axios not installed. Using built-in http module instead...\n');
      await testFlaskWithHttp();
    } else if (error.response) {
      console.log('📥 Flask Response:', error.response.data);
      if (error.response.data.success) {
        console.log('🎉 SUCCESS!');
      } else {
        console.log('❌ Failed:', error.response.data.message);
      }
    } else {
      console.log('❌ Request failed:', error.message);
    }
  }
}

async function testFlaskWithHttp() {
  const http = require('http');
  
  const timestamp = Math.floor(Date.now() / 1000).toString();
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
  
  console.log(`Using built-in http module...`);
  console.log(`Timestamp: ${timestamp}`);
  console.log(`Signature: ${signature}`);
  
  const options = {
    hostname: 'localhost',
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
      console.log('\n📥 Flask Response:');
      console.log(data);
      
      try {
        const response = JSON.parse(data);
        if (response.success) {
          console.log('\n🎉 SUCCESS! Flask API #4 is working!');
          console.log('✅ All 4 ML APIs are now functional!');
        } else {
          console.log('\n❌ Still failing:', response.message);
        }
      } catch (parseError) {
        console.log('Response not JSON');
      }
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ HTTP request failed:', error.message);
  });
  
  req.write(body);
  req.end();
}

testFlaskWithAxios();