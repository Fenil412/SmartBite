// Debug HMAC signature mismatch between Node.js and Flask
// Run this: node debug-hmac-mismatch.js

const crypto = require('crypto');
const fs = require('fs');

// Read secrets from both .env files
function readEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const env = {};
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return env;
  } catch (error) {
    console.log(`Error reading ${filePath}:`, error.message);
    return {};
  }
}

function debugHMACMismatch() {
  console.log('🔍 Debugging HMAC Signature Mismatch\n');
  
  // Read secrets from both .env files
  const nodeEnv = readEnvFile('server/.env');
  const flaskEnv = readEnvFile('Models/.env');
  
  console.log('📋 Environment Variables:');
  console.log(`Node.js INTERNAL_HMAC_SECRET: "${nodeEnv.INTERNAL_HMAC_SECRET}"`);
  console.log(`Flask INTERNAL_HMAC_SECRET:   "${flaskEnv.INTERNAL_HMAC_SECRET}"`);
  console.log(`Secrets match: ${nodeEnv.INTERNAL_HMAC_SECRET === flaskEnv.INTERNAL_HMAC_SECRET}`);
  
  if (nodeEnv.INTERNAL_HMAC_SECRET !== flaskEnv.INTERNAL_HMAC_SECRET) {
    console.log('\n❌ HMAC SECRETS DO NOT MATCH!');
    console.log('This is the root cause of the signature mismatch.');
    return;
  }
  
  console.log('\n✅ HMAC secrets match, testing signature generation...\n');
  
  // Test signature generation
  const secret = nodeEnv.INTERNAL_HMAC_SECRET;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  // Test different body formats
  const testPayloads = [
    // Compact JSON (no spaces)
    '{"userId":"695122887f6900d7c05e54ba","data":{"user":{"id":"695122887f6900d7c05e54ba","username":"mltest","age":25}}}',
    
    // With timestamp
    `{"userId":"695122887f6900d7c05e54ba","data":{"user":{"id":"695122887f6900d7c05e54ba","username":"mltest","age":25}},"timestamp":"${timestamp}"}`,
    
    // Pretty printed JSON
    JSON.stringify({
      userId: "695122887f6900d7c05e54ba",
      data: {
        user: {
          id: "695122887f6900d7c05e54ba",
          username: "mltest",
          age: 25
        }
      }
    }, null, 2)
  ];
  
  console.log('🧪 Testing different payload formats:\n');
  
  testPayloads.forEach((body, index) => {
    console.log(`Test ${index + 1}:`);
    console.log(`Body: ${body.substring(0, 100)}${body.length > 100 ? '...' : ''}`);
    console.log(`Length: ${body.length} chars`);
    
    const message = timestamp + body;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');
    
    console.log(`HMAC input: "${timestamp}${body.substring(0, 50)}..."`);
    console.log(`Signature: ${signature}`);
    console.log('');
  });
  
  console.log('🔧 Debugging Steps:');
  console.log('1. Check Flask terminal for debug output when you run the test');
  console.log('2. Compare the "Expected signature" from Flask with signatures above');
  console.log('3. Check if Flask is receiving the exact same body format');
  console.log('4. Verify timestamp format matches between Node.js and Flask');
  
  console.log('\n📝 Next Steps:');
  console.log('1. Run: node test-flask-timestamp-fix.js');
  console.log('2. Check Flask terminal debug output');
  console.log('3. Compare signatures from this debug with Flask expected signature');
}

debugHMACMismatch();