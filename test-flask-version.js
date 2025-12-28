// Test if Flask server is using updated code
// Run this: node test-flask-version.js

const { exec } = require('child_process');

async function testFlaskVersion() {
  console.log('🔍 Testing if Flask server is using updated code...\n');
  
  // Send a request that should trigger debug output
  const curlCommand = `curl -s -X POST http://localhost:5000/internal/sync-user ` +
    `-H "Content-Type: application/json" ` +
    `-H "x-timestamp: 1234567890" ` +
    `-H "x-signature: invalid" ` +
    `-d '{"test": "data"}'`;
  
  console.log('📤 Sending test request to Flask...');
  console.log('🔍 If Flask is using updated code, you should see DEBUG output in Flask terminal\n');
  
  exec(curlCommand, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Curl failed:', error.message);
      return;
    }
    
    console.log('📥 Flask Response:');
    console.log(stdout);
    
    try {
      const response = JSON.parse(stdout);
      
      if (response.message && response.message.includes('time diff:')) {
        console.log('\n✅ Flask is using UPDATED code!');
        console.log('   - New error message format detected');
        console.log('   - Debug output should be visible in Flask terminal');
      } else if (response.message === 'Request expired') {
        console.log('\n❌ Flask is using OLD code');
        console.log('   - Old error message format');
        console.log('   - Flask server needs to be restarted');
      } else {
        console.log('\n🤔 Unexpected response format');
      }
      
    } catch (parseError) {
      console.log('Response not JSON:', stdout);
    }
    
    console.log('\n🔧 Next Steps:');
    console.log('1. Check Flask terminal for DEBUG output');
    console.log('2. If no DEBUG output, Flask server needs restart');
    console.log('3. In Kiro terminal: Ctrl+C then python -m app.main');
  });
}

testFlaskVersion();